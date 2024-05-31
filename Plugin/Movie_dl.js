const { hacxkMovieSearch, hacxkMoviedl } = require('hacxk-movie-scrapper');
const request = require('request');

module.exports = (Command) => {
    Command({
        cmd: 'tamilyogi',
        desc: 'Get TamilYogi Movie Direct Download Link All Quality',
        react: "📽️",
        type: 'SEARCH COMMANDS',
        handler: async (m, sock) => {
            const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            const [command, ...args] = OriginalText.split(' ');

            if (args.length < 1) {
                await sock.sendMessage(m.key.remoteJid, { text: 'Please provide a movie name or link *EXAMPLE:*`https://tamilyogi.beer/money-heist-season-01-2017-tamil-dubbed-series-hd-720p-watch-online/` or `Money heist` to search for.' }, { quoted: m });
                await sock.sendMessage(m.key.remoteJid, { react: { text: "❓", key: m.key } });
                return;
            }

            await sock.sendMessage(m.key.remoteJid, { react: { text: "🔍", key: m.key } });

            const input = args.join(' ');

            // Check if the input is a link
            if (isTamilYogiLink(input)) {
                await getDirectDL2(sock, m, input);
                return;
            }

            // If not a link, proceed with keyword search
            await sock.sendMessage(m.key.remoteJid, { text: `Searching for keyword: ${input}` }, { quoted: m });

            try {
                const result = await hacxkMovieSearch(input);

                if (result && Array.isArray(result.results) && result.results.length > 0) {
                    const message = result.results.map((movie, index) => `${index + 1}. ${movie.title}`).join('\n');
                    const sentMessage = await sock.sendMessage(m.key.remoteJid, { text: message + '\n\nReply with the number of the movie you want to download. 🎬' }, { quoted: m });
                    await sock.sendMessage(m.key.remoteJid, { react: { text: "⌛", key: m.key } });

                    const replyHandler = async (msg) => {
                        if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                            const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                            const movieIndex = parseInt(replyText, 10) - 1;
                            await sock.sendMessage(m.key.remoteJid, { react: { text: "🤔", key: m.key } });
                            if (!isNaN(movieIndex) && movieIndex >= 0 && movieIndex < result.results.length) {
                                await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });
                                const selectedMovie = result.results[movieIndex];
                                const confirmationMessage = await sock.sendMessage(m.key.remoteJid, { text: `You selected: *${selectedMovie.title}*\n\n*Movie link:* ${selectedMovie.link}\n\n*To get the direct download link, reply with "1" to this message.*` }, { quoted: m });
                                const downloadLinkHandler = async (replyMsg) => {
                                    if (replyMsg.message?.extendedTextMessage?.contextInfo?.stanzaId === confirmationMessage.key.id) {
                                        const replyText = replyMsg.message?.conversation || replyMsg.message?.extendedTextMessage?.text;
                                        if (replyText.trim() === '1') {
                                            await getDirectDL(sock, m, selectedMovie.link, selectedMovie.title);
                                            await sock.sendMessage(m.key.remoteJid, { react: { text: "🎉", key: m.key } });
                                            sock.ev.off('messages.upsert', downloadLinkHandler);
                                            return;
                                        } else {
                                            await sock.sendMessage(m.key.remoteJid, { text: 'Invalid response. Please reply with "1" to get the direct download link.' }, { quoted: m });
                                        }
                                    }
                                };

                                sock.ev.on('messages.upsert', async ({ messages }) => {
                                    for (let msg of messages) {
                                        await downloadLinkHandler(msg);
                                    }
                                });
                            } else {
                                await sock.sendMessage(m.key.remoteJid, { text: 'Invalid selection. Please reply with a valid movie number. ❌' }, { quoted: m });
                            }
                        }
                    };

                    sock.ev.on('messages.upsert', async ({ messages }) => {
                        for (let msg of messages) {
                            await replyHandler(msg);
                        }
                    });
                } else {
                    await sock.sendMessage(m.key.remoteJid, { text: 'No movies found for the given keyword. ❌' }, { quoted: m });
                    await sock.sendMessage(m.key.remoteJid, { react: { text: "❓", key: m.key } });
                }
            } catch (error) {
                console.error('Error during movie search:', error);
                await sock.sendMessage(m.key.remoteJid, { text: 'An error occurred while searching for movies. ❗' }, { quoted: m });
            }
        }
    });
};

async function getDirectDL(sock, m, link, title) {
    try {
        await sock.sendMessage(m.key.remoteJid, { react: { text: "🔍", key: m.key } });

        const result = await hacxkMoviedl(link);

        if (result && result.status) {
            const movieDetails = result.result;
            let message = `🎬 *Title:* ${title}\n⏱️ *Duration:* ${movieDetails.duration}\n🖼️ *Image:* ${link}\n💾 *Sources:* \n`;

            for (const [index, source] of result.result.sources.entries()) {
                const size = await getFileSize(source.downloadLink);
                const formattedSize = formatFileSize(size);
                message += `${index + 1}. 🗃️ ${source.quality || 'Unknown'} - [⬇️ Download](${source.downloadLink}) - 📦 Size: ${formattedSize}\n`;
            }

            await sock.sendMessage(m.key.remoteJid, { text: message + '*YOU CAN DOWNLOAD 240P BY SENDING **|down240** REPLY TO THIS MESSAGE !Info: Only Download If You Have Quota*' }, { quoted: m });
            await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });
            return;
        } else {
            await sock.sendMessage(m.key.remoteJid, { text: '❌ Failed to get the direct download link.' }, { quoted: m });
        }
    } catch (error) {
        console.error('Error fetching direct download link:', error);
        await sock.sendMessage(m.key.remoteJid, { text: '❗ An error occurred while fetching the direct download link.' }, { quoted: m });
    }
}

async function getDirectDL2(sock, m, link) {
    try {
        await sock.sendMessage(m.key.remoteJid, { react: { text: "🔍", key: m.key } });

        const result = await hacxkMoviedl(link);

        if (result && result.status) {
            const movieDetails = result.result;
            let message = `🎬 *Title:* ${movieDetails.title}\n⏱️ *Duration:* ${movieDetails.duration}\n🖼️ *Image:* ${link}\n💾 *Sources:* \n`;

            for (const [index, source] of result.result.sources.entries()) {
                const size = await getFileSize(source.downloadLink);
                const formattedSize = formatFileSize(size);
                message += `${index + 1}. 🗃️ ${source.quality || 'Unknown'} - [⬇️ Download](${source.downloadLink}) - 📦 Size: ${formattedSize}\n`;
            }

            await sock.sendMessage(m.key.remoteJid, { text: message + '*YOU CAN DOWNLOAD 240P BY SENDING **|down240** REPLY TO THIS MESSAGE !Info: Only Download If You Have Quota*' }, { quoted: m });
            await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });
            return;
        } else {
            await sock.sendMessage(m.key.remoteJid, { text: '❌ Failed to get the direct download link.' }, { quoted: m });
        }
    } catch (error) {
        console.error('Error fetching direct download link:', error);
        await sock.sendMessage(m.key.remoteJid, { text: '❗ An error occurred while fetching the direct download link.' }, { quoted: m });
    }
}

async function getFileSize(url) {
    return new Promise((resolve, reject) => {
        request.head(url, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(parseInt(res.headers['content-length'], 10));
            }
        });
    });
}

function formatFileSize(size) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function isTamilYogiLink(url) {
    const regex = /^https:\/\/(www\.)?tamilyogi\.[a-z]+\/.+$/;
    return regex.test(url);
}
