const axios = require('axios');
const { hacxkAPKScraper } = require('hacxkapkscraper');

module.exports = (Command) => {
    Command({
        cmd: ['apk', 'app', 'software'],
        desc: 'Download Apk (apps, games)',
        react: "🗃️",
        type: 'DOWNLOAD COMMANDS',
        handler: async (m, sock) => {
            const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            const [command, ...args] = OriginalText.split(' ');

            if (args.length < 1) {
                await sock.sendMessage(m.key.remoteJid, { text: 'Hey there! To download an APK, send ".apk [app name]".' }, { quoted: m });
                await sock.sendMessage(m.key.remoteJid, { react: { text: "❓", key: m.key } });
                return;
            }

            await sock.sendMessage(m.key.remoteJid, { react: { text: "🔍", key: m.key } });

            const input = args.join(' ');

            try {
                const result = await axios.get(`https://api.junn4.my.id/search/playstore?query=${input}`);

                const apps = result.data.result.slice(0, 5); // Get the first 5 search results

                const appOptions = apps.map((app, index) => {
                    return `${index + 1}. ${app.nama} by ${app.developer}`;
                });

                const message = `
       ▂▃▅▇█▓▒░ HACXK MD APK DOWNLOADER ░▒▓█▇▅▃▂

🔎 **Search Results for "${input}":**\n\n
${appOptions.map((option, index) => `*${index + 1}.* ${option}`).join('\n')}
\n\n
:point_right: Please reply with the number corresponding to the app you want to download.`;

                const sentMessage = await sock.sendMessage(m.key.remoteJid, { text: message }, { quoted: m });

                const selectedOption = await getUserResponse(m, sock, sentMessage, 1, 5); // Wait for user response

                await sock.sendMessage(m.key.remoteJid, { react: { text: "🔃", key: m.key } });
                  // Get the selected app's link
                const selectedApp = apps[selectedOption - 1];
                const appLink = selectedApp.link;
                const id = appLink.split('?id=')[1];
                console.log("appLink:", appLink);
                console.log("ID:::", id);
                
                const apkInfo = await hacxkAPKScraper(id);

                await sock.sendMessage(m.key.remoteJid, { text: `Apk Info: ${apkInfo}` }, { quoted: m })
                await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });
            } catch (error) {
                console.error('Error searching Play Store:', error);
                await sock.sendMessage(m.key.remoteJid, { text: 'Error searching Play Store. Please try again later.' }, { quoted: m });
            }
        }
    });
};

// Helper function to get user response
async function getUserResponse(m, sock, sentMessage, min, max) {
    return new Promise((resolve, reject) => {
        const replyHandler = async (msg) => {
            if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                const selectedOption = parseInt(replyText);
                if (selectedOption >= min && selectedOption <= max) {
                    resolve(selectedOption);
                    // Unsubscribe from message upserts
                    sock.ev.off('messages.upsert', replyHandler);
                } else {
                    await sock.sendMessage(m.key.remoteJid, { text: `Invalid option. Please select a number between ${min} and ${max}.` }, { quoted: msg });
                }
            }
        };

        sock.ev.on('messages.upsert', async ({ messages }) => {
            for (let msg of messages) {
                await replyHandler(msg);
            }
        });
    });
}
