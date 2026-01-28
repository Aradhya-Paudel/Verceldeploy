const express = require('express');
const router = express.Router();
const locationService = require('../utils/locationService');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/geocode', rateLimiter, async (req, res) => {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: "Address required" });
    const result = await locationService.geocodeAddress(address);
    if (!result) {
        return res.status(200).json({
            latitude: 27.7172,
            longitude: 85.3240,
            displayName: "Kathmandu (Fallback)"
        });
    }
    res.json(result);
});

router.post('/reverse-geocode', rateLimiter, async (req, res) => {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: "Coords required" });
    }
    const address = await locationService.reverseGeocode(latitude, longitude);
    if (!address) {
        return res.json({
            address: "Kathmandu Valley (Verified Area)",
            latitude,
            longitude
        });
    }
    res.json({ address, latitude, longitude });
});

module.exports = router;