const { delay, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require('fs');
const path = require('path');

module.exports = (Command) => {
    Command({
        cmd: ['setprofilepic'], // Define multiple commands as an array
        desc: 'Update Profile Picture Of The Bot By Command',
        react: "💨", // Reaction emoji
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            try {
                const { remoteJid, participant, quoted } = m.key;

                // Check if the command sender is the owner or the bot itself
                const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
                allowedNumbers.push(sock.user.id); // Add the bot's number to allowed numbers

                if (!allowedNumbers.includes(participant || remoteJid)) {
                    await sendWithReaction(sock, remoteJid, "🚫", "Only the owner or bot can update profile picture.", m);
                    return;
                }

                // Initial check for group chat
                if (m.key.remoteJid.endsWith('@g.us')) {
                    // Check if the bot is an admin in the group
                    const groupMetadata = await sock.groupMetadata(remoteJid);
                    const botId = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";
                    const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botId) && p.admin);

                    if (!botIsAdmin) {
                        await sendWithReaction(sock, remoteJid, "🤖", "I cannot update new profile picture because I am not a superadmin or admin in this group.", m);
                        return;
                    }

                    const ms = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

                    if (!ms) {
                        await sendWithReaction(sock, remoteJid, "❌", "Please Reply to an Image Message To Update Profile 🗑️", m);
                        return;
                    }

                    const stream = await downloadContentFromMessage(ms, 'image');
                    const chunks = [];
                    stream.on('data', chunk => chunks.push(chunk));
                    stream.on('end', async () => {
                        const buffer = Buffer.concat(chunks);
                        const fileName = `profile_${Date.now()}.jpg`;
                        const folderPath = path.join(__dirname, '../Assets/_ProfileAssets');
                        const filePath = path.join(folderPath, fileName);

                        if (!fs.existsSync(folderPath)) {
                            fs.mkdirSync(folderPath, { recursive: true });
                        }

                        fs.writeFileSync(filePath, buffer);

                            try {
                                await sock.removeProfilePicture(remoteJid);
                                await delay(500);
                            } catch (error) {
                                // Handle the case where the profile picture is already removed
                                if (error.message.includes('item-not-found')) {
                                    console.log('Profile picture already removed');
                                } else {
                                    // Handle other errors
                                    throw error;
                                }
                            }

                        const imageData = fs.readFileSync(filePath);
                        await sock.updateProfilePicture(remoteJid, imageData);
                        await sendWithReaction(sock, remoteJid, "✅", "Profile picture updated!", m);


                        // Delete the picture from storage
                        fs.unlinkSync(filePath);
                    });
                } else {
                    const ms = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

                    if (!ms) {
                        await sendWithReaction(sock, remoteJid, "❌", "Please Reply to an Image Message To Update Profile 🗑️", m);
                        return;
                    }

                    const stream = await downloadContentFromMessage(ms, 'image');
                    const chunks = [];
                    stream.on('data', chunk => chunks.push(chunk));
                    stream.on('end', async () => {
                        const buffer = Buffer.concat(chunks);
                        const fileName = `profile_${Date.now()}.jpg`;
                        const folderPath = path.join(__dirname, '../Assets/_ProfileAssets');
                        const filePath = path.join(folderPath, fileName);

                        if (!fs.existsSync(folderPath)) {
                            fs.mkdirSync(folderPath, { recursive: true });
                        }

                        fs.writeFileSync(filePath, buffer);

                            await sock.removeProfilePicture(sock.user.id);
                            await delay(500);
                

                        const imageData = fs.readFileSync(filePath);
                        await sock.updateProfilePicture(sock.user.id, imageData);
                        await sendWithReaction(sock, remoteJid, "✅", "Profile picture updated!", m);

                        // Delete the picture from storage
                        fs.unlinkSync(filePath);
                    });
                }
            } catch (error) {
                console.error('Error updating profile picture:', error);
                await sendWithReaction(sock, remoteJid, "❌", "Failed to update profile picture!", m);
            }
        }
    });
};

// Helper function to send a message with a reaction and WhatsApp font hacks
async function sendWithReaction(sock, remoteJid, reaction, text, m) {
    // Apply WhatsApp font hacks (bold, italic, etc.) to the text message
    const formattedText = text
        .replace(/\*(.+?)\*/g, "*$1*")   // Bold
        .replace(/_(.+?)_/g, "_$1_")    // Italics
        .replace(/~(.+?)~/g, "~$1~");   // Strikethrough

        await msg.react(reaction, m);
        await msg.reply(formattedText, m);
}
