module.exports = (Command) => {
    Command({
        cmd: ['uptime'],
        desc: 'Check how long the bot has been running',
        react: "⏱️",
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            const startTime = process.uptime(); // Get the bot's uptime in seconds
            const hours = Math.floor(startTime / 3600);
            const minutes = Math.floor((startTime % 3600) / 60);
            const seconds = Math.floor(startTime % 60);

            await sock.sendMessage(m.key.remoteJid, {
                text: `Bot uptime: *${hours}* hours, *${minutes}* minutes, *${seconds}* seconds`
            }, { quoted: m });
        }
    });
};
