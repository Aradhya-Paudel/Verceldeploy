const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/ai';

// Sample Image: A public domain car accident image or reliable placeholder
// 1x1 Red Dot placeholder
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function verifyAI() {
    console.log("🤖 Starting AI Integration Verification...");

    try {
        // 1. Analyze Image
        console.log("\n1️⃣  Testing Vision (Image Analysis)...");
        console.log("   Sending image:", SAMPLE_IMAGE);

        const visionRes = await axios.post(`${BASE_URL}/analyze-image`, {
            imageUrl: SAMPLE_IMAGE
        });

        console.log("✅ Vision Response:", JSON.stringify(visionRes.data, null, 2));

        // 2. Explain Decision
        console.log("\n2️⃣  Testing Reasoning (Explanation)...");
        const explainRes = await axios.post(`${BASE_URL}/explain`, {
            matchData: {
                incidentType: "Car Crash",
                chosenHospital: { name: "Bir Hospital", distance: 2.5, bedsAvailable: 10, specialties: ["Trauma"] },
                alternatives: [{ name: "Teaching Hospital", distance: 4.0 }]
            }
        });

        console.log("✅ Explanation:", explainRes.data.explanation);

        console.log("\n✨ AI SERVICE VERIFIED ✨");

    } catch (err) {
        console.error("\n❌ AI CHECK FAILED:", err.message);
        if (err.response) {
            console.error("   Data:", err.response.data);
        }
    }
}

verifyAI();
