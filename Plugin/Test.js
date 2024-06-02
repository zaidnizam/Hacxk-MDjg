const { delay } = require("@whiskeysockets/baileys");


module.exports = (Command) => {
    Command({
        cmd: ['edit'], // Define multiple commands as an array
        desc: 'Check ping in ms',
        react: "💨", // Reaction emoji
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
           const l = await sock.sendMessage(m.key.remoteJid, { text: 'Hi' })
           await delay(3000)
           const newL = 'Helooooo'
           msg.edit(l, newL, m)
        }
    });
};
