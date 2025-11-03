const axios = require("axios");

module.exports.config = {
  name: "gpt4o",
  role: 0,
  credits: "Jay Mar",
  description: "Interact with GPT-4o (text + image support)", // API by Kohi
  hasPrefix: false,
  version: "1.0.0",
  aliases: ["gpt", "gptimg", "openai"],
  usage: "gpt4o [prompt] (optionally reply to an image)",
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();
  const isReply = event.type === "message_reply";
  const hasImageReply =
    isReply &&
    event.messageReply.attachments &&
    event.messageReply.attachments[0].type === "photo";

  const loading = await new Promise((resolve) => {
    api.sendMessage("⏳ Searching....", event.threadID, (err, info) => resolve(info));
  });

  try {
    const userID = event.senderID;
    let apiUrl = "";

    if (hasImageReply) {
      const imageUrl = encodeURIComponent(event.messageReply.attachments[0].url);
      const query = encodeURIComponent(prompt || "");
      apiUrl = `https://api-library-kohi.onrender.com/api/gpt4o?prompt=${query}&imageUrl=${imageUrl}&user=${userID}`;
    } else if (prompt) {
      const query = encodeURIComponent(prompt);
      apiUrl = `https://api-library-kohi.onrender.com/api/gpt4o?prompt=${query}&user=${userID}`;
    } else {
      api.unsendMessage(loading.messageID);
      return api.sendMessage("❗ Please provide a prompt or reply to an image.", event.threadID, event.messageID);
    }

    const res = await axios.get(apiUrl);
    const responseText = res.data?.data || "No response from GPT-4o.";

    api.unsendMessage(loading.messageID);
    return api.sendMessage(
      `🤖 𝗚𝗣𝗧-𝟰𝗼\n━━━━━━━━━━━━━━━━━━\n${responseText}`,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    api.unsendMessage(loading.messageID);
    return api.sendMessage("❌ Failed to process your request. Please try again later.", event.threadID);
  }
};
