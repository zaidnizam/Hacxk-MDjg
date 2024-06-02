const { delay } = require("@whiskeysockets/baileys");

module.exports = (Command) => {
    Command({
        cmd: 'restart',
        desc: 'Restarts the bot',
        react: "🔄",
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            const jid = m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid;
            // Extract the correct bot ID including the server
            const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";

            // Check if the command sender is the owner or the bot itself
            const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
            allowedNumbers.push(botNumber);

            if (!allowedNumbers.includes(jid)) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: "🚫 *Only the owner or the bot can restart the bot.*"
                }, { quoted: m });
                return;
            }

            // Send a restart notification message
            await sock.sendMessage(m.key.remoteJid, {
                text: "🔄 *Bot is restarting...*\n\nPlease wait a moment while I come back online."
            }, { quoted: m });
            await delay(2500);

            // End the current connection
            sock.end();

            // Optionally, you can add a delay or a callback to handle the bot restart logic here
            // For example, you might want to use a process manager like PM2 to restart the bot automatically
        }
    });
};
