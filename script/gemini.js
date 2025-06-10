const axios = require("axios");

module.exports.config = {
  name: "gemini",
  role: 0,
  credits: "Jay Mar",
  description: "Interact to Gemini",
  hasPrefix: false,
  version: "1.0.0",
  aliases: ["vision", "geminiimg"],
  usage: "gemini [prompt] (optionally reply to an image)",
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();
  const isReply = event.type === "message_reply";
  const hasImageReply =
    isReply &&
    event.messageReply.attachments &&
    event.messageReply.attachments[0].type === "photo";

  const loading = await new Promise((resolve) => {
    api.sendMessage("⏳ Searing...", event.threadID, (err, info) => resolve(info));
  });

  try {
    let apiUrl = "";
    const apiKey = "your_apikey"; //dito ka kumuha https://kaiz-apis.gleeze.com
    const userID = event.senderID;

    if (hasImageReply) {
      const imageUrl = encodeURIComponent(event.messageReply.attachments[0].url);
      const query = encodeURIComponent(prompt || "");
      apiUrl = `https://kaiz-apis.gleeze.com/api/gemini-vision?q=${query}&uid=${userID}&imageUrl=${imageUrl}&apikey=${apiKey}`;
    } else if (prompt) {
      const query = encodeURIComponent(prompt);
      apiUrl = `https://kaiz-apis.gleeze.com/api/gemini-vision?q=${query}&uid=${userID}&imageUrl=&apikey=${apiKey}`;
    } else {
      api.unsendMessage(loading.messageID);
      return api.sendMessage("❗ Please provide a prompt or reply to an image.", event.threadID, event.messageID);
    }

    const res = await axios.get(apiUrl);
    const description = res.data?.response || "No response from API.";

    api.unsendMessage(loading.messageID);
    return api.sendMessage(
      `🤖 𝗚𝗘𝗠𝗜𝗡𝗜\n━━━━━━━━━━━━━━━━━━\n${description}`,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error("❌", error.message);
    api.unsendMessage(loading.messageID);
    return api.sendMessage("❌ Failed to process your request. Please try again later.", event.threadID);
  }
};