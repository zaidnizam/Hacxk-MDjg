module.exports = (Command) => {
    Command({
        cmd: ['unmute'],
        desc: 'UnMute Group Chat IF BOT IS ADMIN',
        react: "😀", 
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
        
            const { remoteJid, participant, quoted } = m.key;

            // Initial checks
            if (!remoteJid.endsWith('@g.us')) {
                await sendWithReaction(sock, remoteJid, "❌", "*This command can only be used in groups.*", m);
                return;
            }

            // Extract the correct bot ID including the server
            const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";

            // Check if the command sender is the owner or the bot itself
            const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
            allowedNumbers.push(botNumber); 
            if (!allowedNumbers.includes(participant)) {
                await sendWithReaction(sock, remoteJid, "🚫", "*Only the owner or bot can unmute group chat.*", m);
                return;
            }

            // Check if the bot is an admin in the group
            const groupMetadata = await sock.groupMetadata(remoteJid);
            const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);

            if (!botIsAdmin) {
                await sendWithReaction(sock, m.key.remoteJid, "🤖", "*I cannot unmute chat because I am not an admin in this group.*", m);
                return;
            }
            const groupInfo = await sock.groupMetadata(m.key.remoteJid)
          if (groupInfo.announce) {
          await sock.groupSettingUpdate(m.key.remoteJid, "not_announcement");
          return
          } else {
            await msg.reply('Group Already UnMuted!', m)
            return
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
