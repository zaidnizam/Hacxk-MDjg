const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = (Command) => {
    Command({
        cmd: ['setmenuwall'],
        desc: 'Set the menu wall image (Owner only)',
        react: "🖼️",
        type: 'OWNER COMMANDS',
        handler: async (m, sock) => {
            try {
                const ownerNumbers = global.botSettings.ownerNumbers;
                const senderNumber = m.key.remoteJid.replace(/[^0-9]/g, '');
                const isOwner = ownerNumbers.includes(senderNumber);

                if (!isOwner || !m.key.fromMe) {
                    return await sock.sendMessage(m.key.remoteJid, { text: "Only bot owners can use this command." }, { quoted: m });
                }

                const msg = m.message;
                const media = msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

                if (!media) {
                    return await sock.sendMessage(m.key.remoteJid, { text: "Please reply to an image message with this command." }, { quoted: m });
                }

                const stream = await downloadContentFromMessage(media, 'image');
                const chunks = [];
                stream.on('data', chunk => chunks.push(chunk));
                stream.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const fileName = `menu_wall_${Date.now()}.jpg`;
                    const folderPath = path.join(__dirname, '../Assets/_MenuAssets');
                    const filePath = path.join(folderPath, fileName);

                    if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath, { recursive: true });
                    }

                    fs.writeFileSync(filePath, buffer);

                     sock.sendMessage(m.key.remoteJid, { text: "Menu wall image set successfully!" }, { quoted: m });
                });
            } catch (error) {
                console.error("Error setting menu wall image:", error);
                await sock.sendMessage(m.key.remoteJid, { text: "An error occurred while setting the menu wall image." }, { quoted: m });
            }
        }
    });
};
