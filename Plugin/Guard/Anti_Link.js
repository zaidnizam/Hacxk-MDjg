module.exports = (Checker) => {
    Checker({
        name: 'AntiLinkChecker',
        des: '🚫 AntiLinkChecker: Check and Delete Unsafe Links',
        type: 'Group',
        isEnabled: true,
        handler: async (sock, m) => {
            try {
                const { remoteJid, participant } = m.key;

                // Initial checks
                if (!remoteJid.endsWith('@g.us')) {
                    return;
                }

                // Check link presence and validate
                const text = m.message?.extendedTextMessage?.text || m.message?.conversation;
                const linkRegex = /(https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+)/;

                const match = linkRegex.exec(text);
                if (match) {
                    const link = match[0];

                    // You can add additional link validation logic here if needed

                    // Extract the correct bot ID including the server
                    const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";

                    // Fetch group metadata
                    const groupMetadata = await sock.groupMetadata(remoteJid);
                    const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);

                    if (!botIsAdmin) {
                        return;
                    }

                    // Check if the link sender is the owner, bot, or a group admin
                    const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
                    allowedNumbers.push(botNumber);

                    // Add group admins to allowedNumbers
                    const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                    allowedNumbers.push(...groupAdmins);

                    if (!allowedNumbers.includes(participant)) {
                        // Action if sender is not allowed: Delete the message and notify
                        await sock.readMessages([m.key]);
                        await sock.sendMessage(remoteJid, { delete: m.key });
                        await sock.sendMessage(remoteJid, {
                            text: '🚫 You are not allowed to send WhatsApp group links. Please contact an admin to send the link via them. 📞 !Please Follow The Group Rules'
                        });
                    }
                }
            } catch (error) {
                console.error('Error in AntiLinkChecker handler:', error);
                await sock.sendMessage(remoteJid, {
                    text: '⚠️ An error occurred while processing the link. Please try again later.'
                });
            }
        }
    });
};
