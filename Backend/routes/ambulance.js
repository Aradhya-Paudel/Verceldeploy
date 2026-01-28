const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { verifyToken, requireRole } = require('../middleware/auth');
const socketManager = require('../utils/socketManager');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// All routes require Ambulance role
router.use(verifyToken, requireRole(['ambulance', 'admin']));

// START TRIP
// POST /api/ambulance/trip/start
// Body: { hospitalId, patientId, distanceKm, etaMinutes }
router.post('/trip/start', async (req, res) => {
    const { hospitalId, patientId, distanceKm, etaMinutes } = req.body;
    const ambulanceId = req.user.entityId;

    if (!ambulanceId) {
        return res.status(400).json({ error: "User not linked to an ambulance entity" });
    }

    try {
        // 1. Check Hospital Capacity (Double Check)
        const { data: hospital } = await supabase
            .from('hospitals')
            .select('beds_available')
            .eq('id', hospitalId)
            .single();

        if (!hospital || hospital.beds_available < 1) {
            return res.status(409).json({ error: "Hospital has no beds available" });
        }

        // 2. Create Ambulance Trip
        const { data: trip, error: tripError } = await supabase
            .from('ambulance_trips')
            .insert([{
                ambulance_id: ambulanceId,
                hospital_id: hospitalId,
                patient_id: patientId || null,
                status: 'in_transit',
                distance_km: distanceKm,
                started_at: new Date()
            }])
            .select()
            .single();

        if (tripError) throw tripError;

        // 3. Create Resource Reservation (Confirmed)
        // We reserve 1 bed immediately upon trip start
        const { error: resError } = await supabase
            .from('resource_reservations')
            .insert([{
                hospital_id: hospitalId,
                ambulance_trip_id: trip.id,
                beds_reserved: 1,
                status: 'confirmed',
                expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry or until completion
            }]);

        if (resError) {
            // Rollback trip if reservation fails? Or just log? 
            // For MVP, log and proceed but warn.
            console.error("Reservation failed:", resError);
        } else {
            // Decrement available beds in Hospital (Optimistic)
            // Note: Real production would use a transaction or RPC for atomicity
            await supabase.rpc('decrement_beds', { hospital_id_param: hospitalId });
            // Assuming RPC exists, if not, we do direct update:
            // await supabase.from('hospitals').update({ beds_available: hospital.beds_available - 1 }).eq('id', hospitalId);
            // Let's stick to update for now if RPC missing
            await supabase
                .from('hospitals')
                .update({ beds_available: hospital.beds_available - 1 })
                .eq('id', hospitalId);
        }

        // 4. Emit Events
        // To Hospital
        socketManager.emitToHospital(hospitalId, 'trip:started', {
            tripId: trip.id,
            ambulanceId,
            eta: etaMinutes,
            timestamp: new Date()
        });

        // To Admins
        socketManager.emitToAdmins('trip:started', {
            tripId: trip.id,
            hospitalId,
            ambulanceId
        });

        res.status(201).json({ success: true, trip });

    } catch (error) {
        console.error("Start Trip Error:", error);
        res.status(500).json({ error: "Failed to start trip" });
    }
});

// UPDATE LOCATION
// POST /api/ambulance/location
router.post('/location', async (req, res) => {
    const { latitude, longitude, heading, speed } = req.body;
    const ambulanceId = req.user.entityId;

    // Emit to socket (handled in socketManager too, but this is REST fallback)
    // Actually socket connection handles this directly usually.
    // We'll keep this as a sync endpoint for state if needed.

    // Just return success
    res.json({ success: true });
});

// COMPLETE TRIP
// PATCH /api/ambulance/trip/:id/complete
router.patch('/trip/:id/complete', async (req, res) => {
    const tripId = req.params.id;
    const { status } = req.body; // 'arrived' or 'completed'

    if (!['arrived', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const { data: trip, error } = await supabase
            .from('ambulance_trips')
            .update({
                status,
                completed_at: status === 'completed' ? new Date() : null
            })
            .eq('id', tripId)
            .select()
            .single();

        if (error) throw error;

        // Handle Reservation
        if (status === 'completed' || status === 'arrived') {
            // Reservation fulfilled. resource stays consumed.
            await supabase
                .from('resource_reservations')
                .update({ status: 'expired' }) // technically 'fulfilled' but 'expired' stops checks
                .eq('ambulance_trip_id', tripId);

            socketManager.emitToHospital(trip.hospital_id, 'trip:arrived', { tripId });

        } else if (status === 'cancelled') {
            // Release resources
            await supabase
                .from('resource_reservations')
                .update({ status: 'cancelled' })
                .eq('ambulance_trip_id', tripId);

            // Increment beds back?
            // Fetch current
            const { data: h } = await supabase.from('hospitals').select('beds_available').eq('id', trip.hospital_id).single();
            if (h) {
                await supabase.from('hospitals').update({ beds_available: h.beds_available + 1 }).eq('id', trip.hospital_id);
            }

            socketManager.emitToHospital(trip.hospital_id, 'trip:cancelled', { tripId });
        }

        res.json({ success: true, trip });

    } catch (error) {
        console.error("Complete Trip Error:", error);
        res.status(500).json({ error: "Failed to update trip" });
    }
});

module.exports = router;
