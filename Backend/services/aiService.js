const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = 'https://emergency-hackathon.local';
const SITE_NAME = 'Emergency Response System';

// Vision Model
const VISION_MODEL = 'google/gemma-3-12b-it:free';
const VISION_FALLBACK = 'qwen/qwen-2.5-vl-7b-instruct:free';

// Reasoning/Chat Model
const CHAT_MODEL = 'google/gemma-3-12b-it:free';
const CHAT_FALLBACK = 'google/gemma-3-4b-it:free';

const aiService = {
    /**
     * Analyze an image URL for accident severity and details.
     */
    async analyzeAccidentImage(imageUrl) {
        if (!imageUrl) throw new Error("Image URL is required");

        const prompt = `
        You are an AI embedded in an Emergency Response System.
        Analyze the provided image of a traffic accident or emergency scene.
        
        Provide a JSON response with:
        - "severity": Number 1-10 (10 is catastrophic).
        - "casualty_estimate": String (e.g., "1-2 people").
        - "hazards": Array of strings (e.g. ["fire", "leak", "blocked_road"]).
        - "vehicle_types": Array of strings involved.
        - "description": Brief 1-sentence summary.

        Return ONLY raw JSON. Do not include markdown formatting.
        `;

        const tryModel = async (model) => {
            console.log(`🤖 AI Vision Attempt with ${model}...`);
            const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model: model,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ]
                    }
                ]
            }, {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": SITE_URL,
                    "X-Title": SITE_NAME,
                    "Content-Type": "application/json"
                },
                timeout: 60000 // 60s timeout
            });

            const content = response.data.choices[0].message.content;
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        };

        try {
            return await tryModel(VISION_MODEL);
        } catch (error) {
            console.warn(`⚠️ AI Vision Primary Failed (${error.response?.status || error.message}), trying fallback...`);
            try {
                return await tryModel(VISION_FALLBACK);
            } catch (fallbackError) {
                console.error("❌ AI Vision all models failed.");
                return { severity: 5, description: "AI Analysis Unavailable (Rate Limited)", hazards: [] };
            }
        }
    },

    /**
     * Explain why a specific hospital was chosen.
     */
    async explainDecision(matchData) {
        const { chosenHospital, alternatives, incidentType } = matchData;

        const prompt = `
        You are a medical logistics logician.
        Explain why ${chosenHospital.name} was selected for a ${incidentType} case.
        
        Context:
        - Chosen: ${chosenHospital.name} (Dist: ${chosenHospital.distance}km, Beds: ${chosenHospital.bedsAvailable}, Spec: ${chosenHospital.specialties}).
        - Alternative: ${alternatives?.[0]?.name || 'None'} (Dist: ${alternatives?.[0]?.distance}km).

        Output a concise 2-sentence explanation.
        `;

        const tryModel = async (model) => {
            console.log(`🤖 AI Chat Attempt with ${model}...`);
            const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model: model,
                messages: [{ role: "user", content: prompt }]
            }, {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": SITE_URL,
                    "X-Title": SITE_NAME,
                },
                timeout: 30000 // 30s timeout
            });

            return response.data.choices[0].message.content;
        };

        try {
            return await tryModel(CHAT_MODEL);
        } catch (error) {
            console.warn(`⚠️ AI Chat Primary Failed, trying fallback...`);
            try {
                return await tryModel(CHAT_FALLBACK);
            } catch (fbErr) {
                return "Optimized hospital selection based on real-time bed availability and proximity.";
            }
        }
    }
};

module.exports = aiService;
