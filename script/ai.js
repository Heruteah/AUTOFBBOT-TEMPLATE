const axios = require("axios");

module.exports.config = {
  name: "ai",
  role: 0,
  credits: "Jay Mar",
  description: "Chat with GPT-5 AI (Kohi API)",
  hasPrefix: false,
  version: "1.0.0",
  aliases: ["gpt", "chatgpt"],
  usage: "ai [prompt]",
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage("❗ Please provide a question or message.", event.threadID, event.messageID);
  }

  const loading = await new Promise((resolve) => {
    api.sendMessage("⏳ Searching...", event.threadID, (err, info) => resolve(info));
  });

  try {
    const userId = event.senderID || "unknown_user";
    const url = `https://api-library-kohi.onrender.com/api/copilot?prompt=${encodeURIComponent(prompt)}&model=gpt-5&user=${userId}`;

    const response = await axios.get(url);
    const answer = response.data?.data?.text || "No response from the AI.";

    await api.editMessage(answer,loading.messageID
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    await api.editMessage("❌ Failed to connect to the AI API.", loading.messageID);
  }
};
