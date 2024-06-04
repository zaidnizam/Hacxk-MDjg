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
                    const msgs = messages[0];
                    const newUser = msgs.key.remoteJid.endsWith('@g.us') ? msgs.key.participant : msgs.key.remoteJid;
                    if (requestedUserNumber !== newUser) {
                        return;
                    }
                    if (msgs.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                        const selectedIndex = parseInt(msgs.message?.extendedTextMessage?.text) - 1;
                        if (selectedIndex >= 0 && selectedIndex < result.data.apks.length) {
                            const selectedApp = result.data.apks[selectedIndex];
                            await msg.reply(`You selected: ${selectedApp.name}\n\nDownload starting...`, msgs);
                            await msg.rate(m)
                            await sock.ev.off('messages.upsert', replyHandler);
                            await downloadApk(selectedApp.url, sock, msgs, selectedApp.size);
                        } else {
                            await msg.reply('Invalid selection. Please try again.', msgs);
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