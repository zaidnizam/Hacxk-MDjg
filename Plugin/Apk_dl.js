const axios = require('axios');
const fs = require('fs');
const { hacxkApkSearch, hacxkApkInfo } = require('../Lib/APKScraper/index');

module.exports = (Command) => {
    Command({
        cmd: ['apk', 'app', 'software'],
        desc: 'Download Apk (apps, games)',
        react: "🗃️",
        type: 'DOWNLOAD COMMANDS',
        handler: async (m, sock) => {
            const args = m.message?.conversation.split(' ').slice(1).join(' ') || m.message?.extendedTextMessage?.text.split(' ').slice(1).join(' ');
            const requestedUserNumber = m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid;
            if (!args) {
                msg.reply('Hey there! To download an APK, send ".apk [app name]".', m);
                msg.react('🚫', m);
                return;
            }
            await msg.react('🔍', m);
            try {
                const result = await hacxkApkSearch(args);
                if (!result) {
                    msg.reply('Ah Sorry We can\'t find anything!');
                    msg.react('😶', m);
                }
                const mes = `
┏━━━━━━━━━━━━━━━━━━━┓
      HACXK MD
💎 APK DOWNLOADER 💎
┗━━━━━━━━━━━━━━━━━━━┛
               
${result.data.apks.map((apk, index) => `
🔰 ${index + 1}. ${apk.name} 🔰
💾 Size: ${apk.size}
⬇️ Downloads: ${apk.downloads}
⭐ Rating: ${apk.rating}
               
`).join('──────────────────')}
               
👇 Reply with the number corresponding to the app you want to download. 👇
                `;
                const sentMessage = await msg.reply(mes, m);
                await msg.react('🤔', m);
                const replyHandler = async ({ messages }) => {
                    const msg = messages[0];
                    const newUser = msg.key.remoteJid.endsWith('@g.us') ? msg.key.participant : msg.key.remoteJid;
                    if (requestedUserNumber !== newUser) {
                        return;
                    }
                    if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                        const selectedIndex = parseInt(msg.message?.extendedTextMessage?.text) - 1;
                        if (selectedIndex >= 0 && selectedIndex < result.data.apks.length) {
                            const selectedApp = result.data.apks[selectedIndex];
                            await sock.sendMessage(msg.key.remoteJid, { text: `You selected: ${selectedApp.name}\n\nDownload starting...` }, { quoted: msg });
                            await sock.ev.off('messages.upsert', replyHandler);
                            await downloadApk(selectedApp.url, sock, msg, selectedApp.size);
                        } else {
                            await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid selection. Please try again.' }, { quoted: msg });
                        }
                    }
                };
                sock.ev.on('messages.upsert', replyHandler);
            } catch (error) {
                console.error(error);
            }
        }
    });
};

async function downloadApk(url, sock, m, size) {
    const maxSizeLimit = global.botSettings.maxAPKDownloadSizeInMB[0] * 1024 * 1024; // Convert to bytes
    try {
        await msg.react('⬇️', m);
        const result = await hacxkApkInfo(url);
        const apkSize = size;
        if (size > maxSizeLimit) {
            const errorMessage = `
┏━━━━━━━━━━━━━━━━┓
   ⚠️ Download Error ⚠️
┗━━━━━━━━━━━━━━━━┛

The APK size (${formatBytes(apkSize)}) exceeds the maximum allowed size (${formatBytes(maxSizeLimit)}).

Please try downloading a smaller APK or increase the size limit in the bot settings.

> Here is the download Link Download It Manually ${result.data.downloadLink}
`;

await msg.react('🚫', m);
            await sock.sendMessage(m.key.remoteJid, { text: errorMessage }, { quoted: m });
            return;
        }

        const response = await axios.get(result.data.downloadLink, { responseType: 'stream' });
        const fileName = `${result.data.appName}.apk`;
        const filePath = `./${fileName}`;

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        await msg.react('⬆️', m);
        const caption = `
┏━━━━━━━━━━━━━━━━━━━┓
         ${result.data.appName}
┗━━━━━━━━━━━━━━━━━━━┛

📦 Version: ${result.data.version}
📝 Author: ${result.data.author}
📥 Latest Version: ${result.data.latestVersion.version}
📆 Last Updated: ${result.data.latestVersion.update}
📂 Size: ${formatBytes(apkSize)}
🔗 Google Play: ${result.data.latestVersion.googlePlayID}

> HACXK MD APK DOWNLOADER
`;

        await sock.sendMessage(m.key.remoteJid, { document: fs.readFileSync(filePath), caption, mimetype: 'application/vnd.android.package-archive' }, { quoted: m });
        fs.unlinkSync(filePath);
        await msg.react('✅', m);
    } catch (error) {
        console.error(error);
    }
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}