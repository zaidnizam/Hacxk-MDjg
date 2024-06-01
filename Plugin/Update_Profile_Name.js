
module.exports = (Command) => {
    Command({
        cmd: ['setprofilename'], // Define multiple commands as an array
        desc: 'Update Profile Name Of The Bot By Command',
        react: "⚙️", // Reaction emoji
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            try {
                const { remoteJid, participant, quoted } = m.key;

                const args = m.message?.conversation.split(' ').slice(1).join(' ') || m.message?.extendedTextMessage?.text.split(' ').slice(1).join(' ');

                // Check if the command sender is the owner or the bot itself
                const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
                allowedNumbers.push(sock.user.id); // Add the bot's number to allowed numbers

                if (!allowedNumbers.includes(participant || remoteJid)) {
                    await sendWithReaction(sock, remoteJid, "🚫", "Only the owner or bot can update profile name. 😔", m);
                    return;
                }

                const ms = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;

                if (args) {
                    await sock.updateProfileName(args);
                    await sock.sendMessage(m.key.remoteJid, { text: "Profile name updated successfully! 🎉" }, { quoted: m });
                } else if (ms) {
                    await sock.updateProfileName(ms);
                    await sock.sendMessage(m.key.remoteJid, { text: "Profile name updated successfully! 🎉" }, { quoted: m });
                } else {
                    await sock.sendMessage(m.key.remoteJid, { text: "Please provide a name to update the profile name. 🤔 `Example: .setprofilename [Text You Need To Set as Profile Name] OR Reply to a messages with .setprofilename`" }, { quoted: m });
                }
            } catch (error) {
                console.error('Error updating profile name:', error);
                await sendWithReaction(sock, remoteJid, "❌", "Failed to update profile name! 😢", m);
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

    await sock.sendMessage(remoteJid, { react: { text: reaction, key: m.key } });
    await sock.sendMessage(remoteJid, { text: formattedText }, { quoted: m });
}
