const { delay } = require('@whiskeysockets/baileys');
const google = require('googlethis');

module.exports = (Command) => {
    Command({
        cmd: ['google'],
        desc: 'Search on Google (first 5 results)',
        react: "🔍",
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
                // Searching reaction
                await sock.sendMessage(m.key.remoteJid, { react: { text: "🔎", key: m.key } });

                let sfe;
                if (global.botSettings.adultSearch) {
                    sfe = true;
                } else {
                    sfe = false;
                }

                const options = {
                    page: 1, 
                    safe: false, // Safe Search
                    parse_ads: false, // If set to true sponsored results will be parsed
                    additional_params: { 
                        // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
                        hl: 'en' 
                    }
                };
                    
                const response = await google.search(query, options);
                console.log(response)

                // Send search results
                for (const result of response.results.slice(0, 1)) {
                    const title = result.title;
                    const description = result.description;
                    const url = result.url;

                    const message = `${title}\n${description}\n${url}`;
                    await sock.sendMessage(m.key.remoteJid, { text: "Error searching on Google. Sorry Bro" }, { quoted: m });
                    await delay(1000); // Delay between sending messages
                }

                // Success reaction
                await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });
            } catch (error) {
                console.error(error);
                // Error reaction
                await sock.sendMessage(m.key.remoteJid, { react: { text: "❌", key: m.key } });
                await sock.sendMessage(m.key.remoteJid, { text: 'Error searching on Google.' }, { quoted: m });
            }
        }
    });
};
