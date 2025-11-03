const axios = require('axios');

module.exports.config = {
    name: "poli",
    description: "Generate an image using Pollinations AI (Flux Model)",
    cooldown: 5,
    aliases: ["flux", "polli"],
    role: 0,
    hasPrefix: false,
    credits: "Jay Mar", // API by Kohi
    usage: "{p}{n} [prompt]",
};

module.exports.run = async function ({ api, event, args }) {
    try {
        const { threadID, messageID } = event;
        const prompt = args.join(" ").trim();

        if (!prompt) return api.sendMessage("❗ Please provide a prompt.", threadID, messageID);

        const waitMsg = await new Promise(resolve => {
            api.sendMessage(`🎨 Generating image for "${prompt}"...`, threadID, (err, info) => resolve(info), messageID);
        });

        const url = `https://api-library-kohi.onrender.com/api/pollinations?prompt=${encodeURIComponent(prompt)}&model=flux`;

        const res = await axios.get(url);
        const imageUrl = res.data?.data?.images?.[0] || res.data?.image || null;

        if (!imageUrl) {
            await api.editMessage("❌ No image returned from the API.", waitMsg.messageID);
            return;
        }

        const imgRes = await axios.get(imageUrl, { responseType: "stream" });
        await api.unsendMessage(waitMsg.messageID);
        api.sendMessage({ attachment: imgRes.data }, threadID, messageID);

    } catch (error) {
        console.error("Poli command error:", error);
        api.sendMessage(`❌: ${error.message}`, event.threadID);
    }
};
