const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const locationService = require('../utils/locationService');
const rateLimiter = require('../middleware/rateLimiter');

// POST /api/match
// Match Best Hospital
router.post('/match', rateLimiter, async (req, res) => {
    let { latitude, longitude, address, injuryType, bloodType, excludeIds } = req.body;

    // 1. Resolve Coordinates
    if (!latitude || !longitude) {
        if (address) {
            // Attempt to geocode
            try {
                const geoResult = await locationService.geocodeAddress(address);
                if (geoResult && Number.isFinite(geoResult.latitude) && Number.isFinite(geoResult.longitude)) {
                    latitude = geoResult.latitude;
                    longitude = geoResult.longitude;
                } else {
                    return res.status(400).json({
                        error: "Unable to geocode address. Please provide valid coordinates or a specific address.",
                        code: "GEOCODING_FAILED"
                    });
                }
            } catch (error) {
                console.error('Geocoding Error:', error.message);
                return res.status(400).json({
                    error: "Unable to geocode address. Please provide valid coordinates or a specific address.",
                    code: "GEOCODING_FAILED"
                });
            }
        } else {
            return res.status(400).json({
                error: "Latitude and longitude, or a valid address, are required",
                code: "VALIDATION_ERROR"
            });
        }
    }

    // 2. Validate Coordinates
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
            error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
            code: "INVALID_COORDINATES"
        });
    }

    try {
        const { data, error } = await supabase.rpc('find_best_hospital_v2', {
            user_lat: parseFloat(latitude),
            user_lng: parseFloat(longitude),
            required_specialist: injuryType || null,
            required_blood_type: bloodType || null,
            exclude_hospital_ids: excludeIds || null
        });

        if (error) throw error;

        // 3. Enhance Response with Map URLs and Formatted Data
        const enhancedMatches = data.map(hospital => {
            return {
                hospital_id: hospital.id,
                name: hospital.name,
                address: hospital.address,
                phone: hospital.phone,
                available_beds: hospital.beds_available,
                blood_inventory: hospital.blood_inventory || {}, // Ensure object
                specialists: hospital.specialties || [],
                distance_meters: Math.round(hospital.distance_km * 1000 * 100) / 100, // Recover meters roughly if needed, or stick to km
                distance_km: Math.round(hospital.distance_km * 100) / 100, // Round to 2 decimals
                latitude: hospital.latitude,
                longitude: hospital.longitude,
                mapUrl: locationService.generateStaticMapUrl(hospital.latitude, hospital.longitude),
                routeMapUrl: locationService.generateRouteMapUrl(latitude, longitude, hospital.latitude, hospital.longitude)
            };
        });

        res.json({
            success: true,
            matches: enhancedMatches
        });

    } catch (err) {
        console.error('Matching Error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to match hospital',
            code: "INTERNAL_SERVER_ERROR",
            details: err.message
        });
    }
});

module.exports = router;
