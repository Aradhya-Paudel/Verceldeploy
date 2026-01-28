const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// UPDATE INCIDENT
// PATCH /api/incidents/:id
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Allowed fields to update
    const allowed = ['status', 'destination_hospital_id', 'ambulance_id'];
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowed.includes(key)) filteredUpdates[key] = updates[key];
    });

    try {
        const { data, error } = await supabase
            .from('incidents')
            .update(filteredUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error(`Error updating incident ${id}:`, err.message);
        res.status(500).json({ error: 'Failed to update incident' });
    }
});

// CREATE INCIDENT (For "Got a Call" manual entry)
// POST /api/incidents
router.post('/', async (req, res) => {
    const { title, location, description, reported_by, priority, image } = req.body;

    // Lazy load aiService to prevent circular deps or load issues if not needed
    const aiService = require('../services/aiService');

    let finalDescription = description || '';

    // AI Analysis (if image provided)
    if (image) {
        try {
            console.log("🤖 Analyzing Incident Image...");
            // Ensure we handle data URI schemes if present, though axios usually handles strings fine if url
            // If base64 data URI, OpenRouter/Qwen supports it as url: "data:image/..."
            const analysis = await aiService.analyzeAccidentImage(image);

            // Append AI findings to description
            finalDescription += `\n\n[AI ANALYSIS]\nSeverity: ${analysis.severity}/10\nCasualties Est: ${analysis.casualty_estimate}\nHazards: ${analysis.hazards?.join(', ')}\nDetails: ${analysis.description}`;

            console.log("✅ AI Analysis Complete:", analysis.severity);
        } catch (aiErr) {
            console.error("⚠️ AI Analysis Failed:", aiErr.message);
            finalDescription += `\n\n[AI ANALYSIS FAILED]`;
        }
    }

    try {
        const { data, error } = await supabase
            .from('incidents')
            .insert([{
                title: title || 'Emergency Request',
                description: finalDescription,
                location: `SRID=4326;POINT(${location.longitude} ${location.latitude})`,
                status: 'pending',
                // priority isn't in schema yet, maybe add later or put in description
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);

    } catch (err) {
        console.error(`Error creating incident:`, err);
        res.status(500).json({ error: 'Failed to create incident', details: err.message });
    }
});

module.exports = router;
