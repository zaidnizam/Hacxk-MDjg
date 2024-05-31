const fs = require('fs');
const path = require('path');

module.exports = (Checker) => {
    Checker({
        name: 'AntiBadWordChecker',
        des: '🚫 AntiBadWordChecker: Check and Delete Unsafe Words',
        type: 'Group',
        isEnabled: true,
        handler: async (sock, m) => {
            try {
                const { remoteJid, participant } = m.key;

                // Initial checks
                if (!remoteJid.endsWith('@g.us')) {
                    return;
                }

                // Check message text
                const text = m.message?.extendedTextMessage?.text.toLowerCase() || m.message?.conversation.toLowerCase();
                if (!text) {
                    return;
                }

                // Load bad words from JSON file
                const badWordsPath = path.join(__dirname, '../../Assets/_Check/AntiBadWord/Word.json');
                const badWords = JSON.parse(fs.readFileSync(badWordsPath, 'utf-8'));

                // Check for bad words
                const containsBadWord = badWords.some(badWord => text.includes(badWord));
                if (!containsBadWord) {
                    return;
                }

                // Extract the correct bot ID including the server
                const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";

                // Fetch group metadata
                const groupMetadata = await sock.groupMetadata(remoteJid);
                const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);

                if (!botIsAdmin) {
                    return;
                }

                // Check if the sender is the owner, bot, or a group admin
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
                        text: '🚫 Your message contained inappropriate language and was deleted. Please follow the group rules. 🛑'
                    });
                }
            } catch (error) {
                console.error('Error in AntiBadWordChecker handler:', error);
                await sock.sendMessage(remoteJid, {
                    text: '⚠️ An error occurred while processing your message. Please try again later.'
                });
            }
        }
    });
};
