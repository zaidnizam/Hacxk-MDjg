const { delay } = require('@whiskeysockets/baileys');
const axios = require('axios');
const { promisify } = require('util');
const gis = promisify(require('g-i-s'));

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

            try {
                const results = await gis(query.toLowerCase());
                const imageCount = Math.min(results.length, 5); // Limit to 5 images or fewer

                // Searching reaction
                await sock.sendMessage(m.key.remoteJid, { react: { text: "🔎", key: m.key } });

                for (let i = 0; i < imageCount; i++) {
                    const imageUrl = results[i].url;
                    const { headers } = await axios.head(imageUrl);
                    const width = headers['content-length'];
                    const height = headers['content-length'];
                    
                    let widthToSend, heightToSend;
                    if (width > height) {
                        widthToSend = 3840; // Landscape resolution width
                        heightToSend = 2160; // Landscape resolution height
                    } else {
                        widthToSend = 2160; // Portrait resolution width
                        heightToSend = 3840; // Portrait resolution height
                    }

                    await sock.sendMessage(m.key.remoteJid, { 
                        image: { url: imageUrl, width, height }, 
                        width: widthToSend, 
                        height: heightToSend
                    }, { quoted: m });
                   await delay(500)
                }

                // Success reaction
                await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });
            } catch (error) {
                console.error(error);
                // Error reaction
                await sock.sendMessage(m.key.remoteJid, { react: { text: "❌", key: m.key } });
                await sock.sendMessage(m.key.remoteJid, { text: 'Error searching for images.' }, { quoted: m });
            }
        }
    });
};
