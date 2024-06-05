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
                await msg.react("🤷‍♂️", m);
                await msg.reply('Please provide a search query!', m);
                return;
            }

            try {
                // Searching reaction
                await msg.react("🔎", m);

                let sfe = global.botSettings.adultSearch ? true : false;

                const options = {
                    page: 1, 
                    safe: sfe, // Safe Search
                    parse_ads: false, // If set to true sponsored results will be parsed
                    additional_params: { 
                        // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
                        hl: 'en' 
                    }
                };
                    
                const response = await google.search(query, options);
                console.log(response)

                // Send search results
                for (const result of response.results.slice(0, 5)) {
                    const title = result.title;
                    const description = result.description;
                    const url = result.url;

                    const message = `${title}\n${description}\n${url}`;
                    await msg.reply(message, m);
                    await delay(1000); // Delay between sending messages
                }

                // Success reaction
                await msg.react("✅", m);
            } catch (error) {
                console.error(error);
                // Error reaction
                await msg.react("❌", m);
                await msg.reply('Error searching on Google.', m);
            }
        }
    });
};
