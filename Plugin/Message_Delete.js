const { delay } = require("@whiskeysockets/baileys");


module.exports = (Command) => {
    Command({
        cmd: 'delete',
        desc: 'delete a message in a group(if bot is admin)',
        react: "🗑️",
        type: 'GROUP COMMANDS',
        handler: async (m, sock) => {
            try {

                const { remoteJid, participant, quoted } = m.key;

                // Check if the command sender is the owner or the bot itself
                const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
                allowedNumbers.push(sock.user.id); // Add the bot's number to allowed numbers

                if (!allowedNumbers.includes(participant)) {
                    await sendWithReaction(sock, remoteJid, "🚫", "Only the owner or bot can delete message.", m);
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
                    await sendWithReaction(sock, m.key.remoteJid, "🤖", "I cannot delete message because I am not a superadmin or admin in this group.", m);
                    return;
                }
                const ms = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage

              if (!ms) {
                await sendWithReaction(sock, remoteJid, "❌", "Please Reply To The Message You Want To Delete 🗑️", m);
                return
              }

              let ryt 
              if (m.key.participant === m?.message?.extendedTextMessage?.contextInfo?.participant) {
                ryt = true 
              } else {
                ryt = false
              }

              const stanId = m?.message?.extendedTextMessage?.contextInfo?.stanzaId

              const message = {
                key: {
                    remoteJid: m.key.remoteJid,
                    fromMe: ryt,
                    id: stanId,
                    participant: m?.message?.extendedTextMessage?.contextInfo?.participant
                }
              }
              
             await sock.sendMessage(message.key.remoteJid, { delete: message.key });
             await delay(750)
             await sock.sendMessage(message.key.remoteJid, { delete: m.key });
             await delay(250)
             sock.sendMessage(m.key.remoteJid, { text: "✅ Message Deleted Success 🗑️" })
            } catch (error) {
                console.error("Error sending message:", error);
                // Handle the error appropriately, like notifying the user or logging the error.
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
