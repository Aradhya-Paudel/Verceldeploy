const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function testVision() {
    console.log("Testing OpenRouter Vision...");
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "nvidia/nemotron-nano-12b-v2-vl:free",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is in this image?" },
                        { type: "image_url", image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Car_crash_2.jpg/800px-Car_crash_2.jpg" } }
                    ]
                }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Success:", response.data.choices[0].message.content);
    } catch (error) {
        if (error.response) {
            console.log("❌ API Error Status:", error.response.status);
            console.log("❌ API Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log("❌ Request Error:", error.message);
        }
    }
}

testVision();
