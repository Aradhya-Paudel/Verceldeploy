const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 1x1 Red Dot PNG
const BASE64_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function testBase64() {
    console.log("Testing OpenRouter Base64 Vision...");
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemma-3-12b-it:free",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What color is this 1x1 image?" },
                        { type: "image_url", image_url: { url: BASE64_IMAGE } }
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

testBase64();
