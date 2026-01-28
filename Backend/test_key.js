const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function testKey() {
    console.log("Testing OpenRouter Key...");
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemma-3-12b-it:free",
            messages: [{ role: "user", content: "Say hello" }]
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

testKey();
