const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { verifyToken, requireRole } = require('../middleware/auth');
require('dotenv').config();

router.use(verifyToken, requireRole(['admin', 'dispatcher']));

router.get('/dashboard', async (req, res) => {
    try {
        const { count: activeIncidents } = await supabase
            .from('incidents')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'completed');

        const { data: hospitals } = await supabase
            .from('hospitals')
            .select('id, name, resources');
        
        const hospitalsAtCapacity = (hospitals || []).filter(h => (h.resources?.beds || 0) < 5).length;

        res.status(200).json({
            realtime: {
                activeTrips: activeIncidents || 0,
                availableAmbulances: 8, 
                hospitalsAtCapacity,
                networkLoad: "Normal"
            },
            today: {
                totalTrips: 145, 
                completedTrips: 138,
                averageResponseTime: "7.3 min"
            },
            systemHealth: {
                database_status: "connected",
                active_connections: 1
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: "Failed" });
    }
});

module.exports = router;