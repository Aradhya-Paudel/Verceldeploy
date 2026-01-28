require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');

const app = express();
const port = process.env.PORT || 3000;

// Startup Validation
if (!process.env.LOCATIONIQ_API_KEY) {
    console.warn('\n⚠️  WARNING: LocationIQ API key not configured. Map features will be disabled.\n');
}

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health Check
app.get('/health', async (req, res) => {
    try {
        const { data, error } = await supabase.from('hospitals').select('count', { count: 'exact', head: true });
        if (error) throw error;
        res.json({ status: 'healthy', dbConnection: 'connected' });
    } catch (err) {
        console.error('Health Check Failed:', err.message);
        res.status(503).json({ status: 'unhealthy', dbConnection: 'disconnected', error: err.message });
    }
});

<<<<<<< HEAD
// Get All Hospitals (Summary View)
=======
const hospitalRoutes = require('./routes/hospital');
const authRoutes = require('./routes/auth');
const logger = require('./utils/logger'); // Will create this soon, but let's prep

// Routes
app.use('/api', require('./routes/match'));
app.use('/api', require('./routes/map'));
app.use('/api', hospitalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ambulance', require('./routes/ambulance'));
app.use('/api/ai', require('./routes/ai')); // AI Integration

// Summary Endpoint (Legacy support if needed, but sticking to new routes)
>>>>>>> 0375cebc56d2e734e055d09a07726edd1ed35eaa
app.get('/api/hospitals', async (req, res) => {
    try {
        const { data, error } = await supabase.from('hospitals_summary').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error fetching hospitals:', err.message);
        res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
});

<<<<<<< HEAD
/**
 * Match Best Hospital
 * POST /api/match
 * Body: { latitude, longitude, injuryType, bloodType, excludeIds }
 */
app.post('/api/match', async (req, res) => {
    const { latitude, longitude, injuryType, bloodType, excludeIds } = req.body;

    // Validate inputs
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
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

        res.json({
            success: true,
            matches: data || []
        });

    } catch (err) {
        console.error('Matching Error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to match hospital',
            details: err.message
        });
    }
});

=======
>>>>>>> 0375cebc56d2e734e055d09a07726edd1ed35eaa
// Root Route
app.get('/', (req, res) => {
    res.json({
        message: 'Hospital Resource Backend is Running',
        endpoints: {
            health: '/health',
            hospitals: '/api/hospitals',
<<<<<<< HEAD
            match: '/api/match'
=======
            hospitalsMap: '/api/hospitals/map',
            match: '/api/match',
            geocode: '/api/geocode',
            auth: '/api/auth'
>>>>>>> 0375cebc56d2e734e055d09a07726edd1ed35eaa
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start Server
const server = app.listen(port, () => {
    console.log(`\n---------------------------------------------------`);
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Supabase Connection Initialized`);
    console.log(`---------------------------------------------------\n`);
});

// Initialize WebSockets
const socketManager = require('./utils/socketManager');
socketManager.init(server);
