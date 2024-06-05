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
                    await msg.reply("Only bot owners can use this command.", m);
                    return;
                }

                const media = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

                if (!media) {
                    await msg.reply("Please reply to an image message with this command.", m);
                    return;
                }

                await msg.react("🖼️", m);

                const stream = await downloadContentFromMessage(media, 'image');
                const chunks = [];
                stream.on('data', chunk => chunks.push(chunk));
                stream.on('end', async () => {
                    const buffer = Buffer.concat(chunks);
                    const fileName = `menu_wall_${Date.now()}.jpg`;
                    const folderPath = path.join(__dirname, '../Assets/_MenuAssets');
                    const filePath = path.join(folderPath, fileName);

                    if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath, { recursive: true });
                    }

                    fs.writeFileSync(filePath, buffer);

                    await msg.reply("Menu wall image set successfully!", m);
                });
            } catch (error) {
                console.error("Error setting menu wall image:", error);
                await msg.reply("An error occurred while setting the menu wall image.", m);
            }
        }
    });
};
