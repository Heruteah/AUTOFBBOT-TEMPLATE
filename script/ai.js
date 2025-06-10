const axios = require("axios");

module.exports.config = {
  name: "ai2",
  role: 0,
  credits: "Jay Mar",
  description: "Interact to o3mini ai",
  hasPrefix: false,
  version: "1.0.0",
  aliases: ["o3mini", "chat"],
  usage: "ai [prompt]",
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage("❗ Please provide a question or prompt.", event.threadID, event.messageID);
  }

  const loading = await new Promise((resolve) => {
    api.sendMessage("⏳ Searching...", event.threadID, (err, info) => resolve(info));
  });

  try {
    const apiKey = "your_apikey";// API KEY MO DITO https://kaiz-apis.gleeze.com
    const url = `https://kaiz-apis.gleeze.com/api/o3-mini?ask=${encodeURIComponent(prompt)}&apikey=${apiKey}`;

    const response = await axios.get(url);
    const answer = response.data?.response || "No response from API.";

    await api.editMessage(
      `🤖 𝗢𝟯-𝗠𝗜𝗡𝗜\n━━━━━━━━━━━━━━━━━━\n${answer}`,
      loading.messageID
    );
  } catch (error) {
    console.error("❌:", error.message);
    await api.editMessage("❌ Failed to get a response from the API.", loading.messageID);
  }
};