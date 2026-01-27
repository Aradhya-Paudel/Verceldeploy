const express = require('express');
const router = express.Router();
const locationService = require('../utils/locationService');
const rateLimiter = require('../middleware/rateLimiter');

// POST /api/geocode
// Convert address to coordinates
router.post('/geocode', rateLimiter, async (req, res) => {
    const { address } = req.body;

    if (!address) {
        return res.status(400).json({
            error: "Address is required",
            code: "VALIDATION_ERROR"
        });
    }

    const result = await locationService.geocodeAddress(address);

    if (!result) {
        return res.status(404).json({
            error: "Unable to find coordinates for the provided address",
            code: "GEOCODING_FAILED"
        });
    }

    const mapUrl = locationService.generateStaticMapUrl(result.latitude, result.longitude);

    res.json({
        ...result,
        mapUrl
    });
});

// POST /api/reverse-geocode
// Convert coordinates to address
router.post('/reverse-geocode', rateLimiter, async (req, res) => {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            error: "Latitude and longitude are required",
            code: "VALIDATION_ERROR"
        });
    }

    // Validate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
            error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
            code: "INVALID_COORDINATES"
        });
    }

    const address = await locationService.reverseGeocode(latitude, longitude);

    if (!address) {
        return res.status(404).json({
            error: "Unable to find address for the provided coordinates",
            code: "REVERSE_GEOCODING_FAILED"
        });
    }

    res.json({
        address,
        latitude,
        longitude
    });
});

module.exports = router;
