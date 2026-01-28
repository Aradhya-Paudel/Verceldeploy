const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/ai/analyze-image
router.post('/analyze-image', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: "No imageUrl provided" });
    }

    try {
        const result = await aiService.analyzeAccidentImage(imageUrl);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Analysis failed" });
    }
});

// POST /api/ai/explain
router.post('/explain', async (req, res) => {
    const { matchData } = req.body;
    try {
        const explanation = await aiService.explainDecision(matchData);
        res.json({ explanation });
    } catch (err) {
        res.status(500).json({ error: "Explanation failed" });
    }
});

module.exports = router;
