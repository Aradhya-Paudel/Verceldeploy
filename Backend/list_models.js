const axios = require('axios');

async function listModels() {
    try {
        const response = await axios.get("https://openrouter.ai/api/v1/models");
        const freeModels = response.data.data.filter(m => m.id.endsWith(':free') || m.pricing.prompt === '0');
        console.log("Free Models Slugs:");
        freeModels.forEach(m => console.log(`- ${m.id}`));
    } catch (error) {
        console.error("Error fetching models:", error.message);
    }
}

listModels();
