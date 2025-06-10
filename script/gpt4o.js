const axios = require("axios");

module.exports.config = {
  name: "gpt4o",
  version: "1.0.0",
  hasPrefix: true,
  aliases: ["gpt", "chatgpt4o"],
  description: "Interact to gpt4o",
  usage: "gpt4o <your question>",
  credits: "Jay Mar",
  role: 0,
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage("❌ Please provide a question", event.threadID, event.messageID);
  }

  const uid = event.senderID;
  const roleplay = ""; // (Optional)

  try {
    const response = await axios.get("https://haji-mix.up.railway.app/api/gpt4o", {
      params: {
        ask: prompt,
        uid,
        roleplay,
        api_key: "23809cc574d0d0d54c458146e70515f8238ad54298aaa479d4ec62742fad2e54",
      },
    });

    const answer = response.data.answer || "⚠️ No response received.";
    api.sendMessage(answer, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Failed to fetch response from GPT-4o API.", event.threadID, event.messageID);
  }
};
