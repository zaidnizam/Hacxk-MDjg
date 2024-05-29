const { delay } = require('@whiskeysockets/baileys');
const gis = require('g-i-s');

module.exports = (Command) => {
    Command({
        cmd: ['img', 'image', 'googleimg', 'images'],
        desc: 'Search for images on Google (first 5 results)', // Updated description
        react: "🖼️",
        type: 'SEARCH COMMANDS',
        handler: async (m, sock) => {
            const query = m.message?.conversation.split(' ').slice(1).join(' ')
                || m.message?.extendedTextMessage?.text.split(' ').slice(1).join(' ');

            if (!query) {
                await sock.sendMessage(m.key.remoteJid, { react: { text: "🤷‍♂️", key: m.key } });
                await sock.sendMessage(m.key.remoteJid, { text: 'Please provide a search query!' }, { quoted: m });
                return;
            }

            gis(query, async (error, results) => {
                if (error) {
                    console.error(error);
                    await sock.sendMessage(m.key.remoteJid, { react: { text: "❌", key: m.key } });
                    await sock.sendMessage(m.key.remoteJid, { text: 'Error searching for images.' }, { quoted: m });
                } else {
                    const imageCount = Math.min(results.length, 5); // Limit to 5 images or fewer
                    // Searching reaction
                    await sock.sendMessage(m.key.remoteJid, { react: { text: "🔎", key: m.key } });
                    if (imageCount > 0) {
                        for (let i = 0; i < imageCount; i++) {
                            const imageUrl = results[i].url;
                            await sock.sendMessage(m.key.remoteJid, { image: { url: imageUrl } }, { quoted: m });
                            await delay(500)
                        }
                         // Searching reaction
                    await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });
                    } else {
                        await sock.sendMessage(m.key.remoteJid, { react: { text: "🤷‍♂️", key: m.key } });
                        await sock.sendMessage(m.key.remoteJid, { text: 'No images found.' }, { quoted: m });
                    }
                }
            });
        }
    });
};
