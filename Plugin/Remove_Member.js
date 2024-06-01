module.exports = (Command) => {
    Command({
        cmd: ["remove", "kick", "unparticipant"],
        desc: "Remove a group participant (owner/bot only)",
        react: "⛔",
        type: "GROUP COMMANDS",
        handler: async (m, sock) => {
            const { remoteJid, participant, quoted } = m.key;

             // Check if the command sender is the owner or the bot itself
             const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
             allowedNumbers.push(sock.user.id); // Add the bot's number to allowed numbers
 
             if (!allowedNumbers.includes(participant)) {
                 await sendWithReaction(sock, remoteJid, "🚫", "Only the owner or bot can remove members.", m);
                 return;
             }
 

            // Check if the command is used in a group
            if (!remoteJid.endsWith('@g.us')) {
                await sendWithReaction(sock, remoteJid, "❌", "This command can only be used in groups.", m);
                return;
            }

            // Check if the bot is an admin in the group
            const groupMetadata = await sock.groupMetadata(remoteJid);
            const botId = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net"; 
            const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botId) && p.admin);

            if (!botIsAdmin) { 
                await sendWithReaction(sock, m.key.remoteJid, "🤖", "I cannot remove participants because I am not a superadmin or admin in this group.", m);
                return;
            }

            let quotedUser;
            if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                quotedUser = m.message.extendedTextMessage.contextInfo.mentionedJid[0]; // Get the first mentioned user
            } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
                quotedUser = m.message.extendedTextMessage.contextInfo.participant; // Get from quoted message
            }

           
            // Check if a quoted message or mentioned user exists
            if (!quotedUser) {
                await sendWithReaction(sock, remoteJid, "🤔", "Please quote the message of the user you want to remove or mention the user with @.", m);
                return;
            }

            try {
                const quotedParticipant = groupMetadata.participants.find(p => p.id === quotedUser);
                const issuerParticipant = groupMetadata.participants.find(p => p.id === participant);

                if (quotedParticipant && quotedParticipant.admin === 'superadmin') {
                    if (issuerParticipant && issuerParticipant.admin !== 'superadmin') {
                        await sendWithReaction(sock, remoteJid, "🚫", "*⚠️ Only superadmins can remove other superadmins!*", m);
                        return;
                    }
                }

                await sock.groupParticipantsUpdate(remoteJid, [quotedUser], "remove");
                await sendWithReaction(sock, remoteJid, "👋", `*🥳 Adios!* @${quotedUser.split("@")[0]} _has left the chat._`, m);
            } catch (error) {
                console.error("Error in remove command:", error);
                await sendWithReaction(sock, remoteJid, "❌", "*⛔ Oops! Something went wrong.* Please try again later.", m);
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