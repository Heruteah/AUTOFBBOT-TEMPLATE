function formatFont(text) {
  const fontMapping = {
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺",
    n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠",
    N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
  };

  return text.split('').map((char) => fontMapping[char] || char).join('');
}

module.exports.config = {
  name: 'help',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['welp'],
  description: "Beginner's guide",
  usage: "Help [page], Help all, or [command]",
  credits: 'heru',
  commandsPerPage: 10
};

module.exports.run = async function ({
  api,
  event,
  enableCommands,
  args
}) {
  const input = args.join(' ').toLowerCase();
  try {
    const commands = enableCommands[0].commands;
    const commandsPerPage = module.exports.config.commandsPerPage;
    const totalCommands = commands.length;
    let helpMessage = `📋 | 𝖢𝖬𝖣𝖲 𝖫𝗂𝗌𝗍: (⁠•⁠ө⁠•⁠)⁠♡\n𝖳𝗈𝗍𝖺𝗅 𝖢𝗈𝗆𝗆𝖺𝖽𝗌: ${totalCommands}🏷️\n\n`;

    if (!input) {
      helpMessage += commands.slice(0, commandsPerPage).map((cmd, index) => 
        `\t${index + 1}. ${formatFont(cmd)}`
      ).join("\n");

      helpMessage += "\n\n𝖥𝗈𝗋 𝖺𝗅𝗅 𝖼𝗆𝖽𝗌, 𝗍𝗒𝗉𝖾 '𝗁𝖾𝗅𝗉 𝖺𝗅𝗅'";
    } else if (input === 'all') {
      helpMessage += commands.map((cmd, index) => 
        `\t${index + 1}. ${formatFont(cmd)}`
      ).join("\n");
    } else if (!isNaN(input)) {
      const page = parseInt(input);
      const totalPages = Math.ceil(totalCommands / commandsPerPage);

      if (page < 1 || page > totalPages) {
        api.sendMessage('Invalid page number.', event.threadID, event.messageID);
        return;
      }

      const start = (page - 1) * commandsPerPage;
      const end = Math.min(start + commandsPerPage, totalCommands);

      helpMessage += commands.slice(start, end).map((cmd, index) => 
        `\t${start + index + 1}. ${formatFont(cmd)}`
      ).join("\n");

      helpMessage += `\nPage ${page} of ${totalPages}`;
    }

    await api.sendMessage(helpMessage, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
  }
};