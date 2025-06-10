const axios = require('axios');

module.exports.config = {
    name: "imagine",
    description: "Generate image",
    cooldown: 5,
    aliases: [],
    role: 0,
    hasPrefix: false,
    cooldowns: 5,
    credits: "Jay Mar", // API by Kaizen
    usage: "{p}{n} [prompt] | [limit 1-4]",
};

module.exports.run = async function ({ api, event, args }) {
    try {
        const { threadID, messageID } = event;
        const input = args.join(" ");
        if (!input) return api.sendMessage("Please provide a prompt.", threadID, messageID);

        const [promptPart, limitPart] = input.split("|").map(x => x.trim());
        const prompt = promptPart;
        let limit = parseInt(limitPart) || 2;

        if (limit < 1 || limit > 4) limit = 2;

        const waitMsg = await new Promise(resolve => {
            api.sendMessage(`🎨 Generating "${prompt}" (${limit} image${limit > 1 ? "s" : ""})...`, threadID, (err, info) => resolve(info), messageID);
        });

        const url = `https://kaiz-apis.gleeze.com/api/fotor?prompt=${encodeURIComponent(prompt)}&limit=${limit}&apikey=your_apikey`; // APIKEY MO DITO https://kaiz-apis.gleeze.com

        const res = await axios.get(url);
        const images = res.data.imageUrls;

        if (!images || images.length === 0) {
            await api.editMessage("❌ No images returned from the API.", waitMsg.messageID);
            return;
        }

        const attachments = await Promise.all(
            images.map(async (imgUrl) => {
                const imgRes = await axios.get(imgUrl, { responseType: "stream" });
                return imgRes.data;
            })
        );

        await api.unsendMessage(waitMsg.messageID);
        api.sendMessage({ attachment: attachments }, threadID, messageID);

    } catch (error) {
        console.error("Imagine command error:", error);
        api.sendMessage(`❌: ${error.message}`, event.threadID);
    }
};