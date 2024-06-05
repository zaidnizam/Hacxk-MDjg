const { hacxkMovieSearch, hacxkMoviedl } = require('hacxk-movie-scrapper');
const request = require('request');

module.exports = (Command) => {
    Command({
        cmd: ['tamilyogi', 'film', 'movie'],
        desc: 'Get TamilYogi Movie Direct Download Link All Quality',
        react: "📽️",
        type: 'SEARCH COMMANDS',
        handler: async (m, sock) => {
            const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            const [command, ...args] = OriginalText.split(' ');

            if (args.length < 1) {
                await msg.reply('Please provide a movie name or link *EXAMPLE:*`https://tamilyogi.beer/money-heist-season-01-2017-tamil-dubbed-series-hd-720p-watch-online/` or `Money heist` to search for.', m);
                await msg.react("❓", m);
                return;
            }

            await msg.react("🔍", m);

            const input = args.join(' ');

            // Check if the input is a link
            if (isTamilYogiLink(input)) {
                await getDirectDL2(sock, m, input);
                return;
            }

            // If not a link, proceed with keyword search
            await msg.reply(`Searching for keyword: ${input}`, m);

            try {
                const result = await hacxkMovieSearch(input);

                if (result && Array.isArray(result.results) && result.results.length > 0) {
                    const message = result.results.map((movie, index) => `${index + 1}. ${movie.title}`).join('\n');
                    const sentMessage = await msg.reply(message + '\n\nReply with the number of the movie you want to download. 🎬', m);
                    await msg.react("⌛", m);

                    const replyHandler = async ({ messages }) => {
                        const msg = messages[0];
                        if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                            const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                            const movieIndex = parseInt(replyText, 10) - 1;
                            await msg.react("🤔", m);
                            const res = await responed(movieIndex, result, sock, m);
                            if (res.respone) {
                                await sock.ev.off('messages.upsert', replyHandler);
                            } 
                        }
                    };

                    sock.ev.on('messages.upsert', replyHandler);

                } else {
                    await msg.reply('No movies found for the given keyword. ❌', m);
                    await msg.react("❓", m);
                }
            } catch (error) {
                console.error('Error during movie search:', error);
                await msg.reply('An error occurred while searching for movies. ❗', m);
            }
        }
    });
};

async function responed(movieIndex, result, sock, m) {
    if (!isNaN(movieIndex) && movieIndex >= 0 && movieIndex < result.results.length) {
        await msg.react("✅", m);
        const selectedMovie = result.results[movieIndex];
        const confirmationMessage = await msg.reply(`You selected: *${selectedMovie.title}*\n\n*Movie link:* ${selectedMovie.link}\n\n*To get the direct download link, reply with "1" to this message.*`, m);
        const downloadLinkHandler = async ({ messages }) => {
            const replyMsg = messages[0];
            if (replyMsg.message?.extendedTextMessage?.contextInfo?.stanzaId === confirmationMessage.key.id) {
                const replyText = replyMsg.message?.conversation || replyMsg.message?.extendedTextMessage?.text;
                if (replyText.trim() === '1') {
                    await getDirectDL(sock, m, selectedMovie.link, selectedMovie.title);
                    await msg.react("🎉", replyMsg);
                    sock.ev.off('messages.upsert', downloadLinkHandler);
                    return;
                } else {
                    await msg.reply('Invalid response. Please reply with "1" to get the direct download link.', replyMsg);
                }
            }
        };
        sock.ev.on('messages.upsert', downloadLinkHandler);
        return { respone: true };
    } else {
        await msg.reply('Invalid selection. Please reply with a valid movie number. ❌', m);
    }
}

async function getDirectDL(sock, m, link, title) {
    try {
        await msg.react("🔍", m);

        const result = await hacxkMoviedl(link);

        if (result && result.status) {
            const movieDetails = result.result;
            let message = `🎬 *Title:* ${title}\n⏱️ *Duration:* ${movieDetails.duration}\n🖼️ *Image:* ${link}\n💾 *Sources:* \n`;

            for (const [index, source] of result.result.sources.entries()) {
                const size = await getFileSize(source.downloadLink);
                const formattedSize = formatFileSize(size);
                message += `${index + 1}. 🗃️ ${source.quality || 'Unknown'} - [⬇️ Download](${source.downloadLink}) - 📦 Size: ${formattedSize}\n`;
            }

            await msg.reply(message + '*YOU CAN DOWNLOAD 240P BY SENDING **|down240** REPLY TO THIS MESSAGE !Info: Only Download If You Have Quota*', m);
            await msg.react("✅", m);
            return;
        } else {
            await msg.reply('❌ Failed to get the direct download link.', m);
        }
    } catch (error) {
        console.error('Error fetching direct download link:', error);
        await msg.reply('❗ An error occurred while fetching the direct download link.', m);
    }
}

async function getDirectDL2(sock, m, link) {
    try {
        await msg.react("🔍", m);

        const result = await hacxkMoviedl(link);

        if (result && result.status) {
            const movieDetails = result.result;
            let message = `🎬 *Title:* ${movieDetails.title}\n⏱️ *Duration:* ${movieDetails.duration}\n🖼️ *Image:* ${link}\n💾 *Sources:* \n`;

            for (const [index, source] of result.result.sources.entries()) {
                const size = await getFileSize(source.downloadLink);
                const formattedSize = formatFileSize(size);
                message += `${index + 1}. 🗃️ ${source.quality || 'Unknown'} - [⬇️ Download](${source.downloadLink}) - 📦 Size: ${formattedSize}\n`;
            }

            await msg.reply(message + '*YOU CAN DOWNLOAD 240P BY SENDING **|down240** REPLY TO THIS MESSAGE !Info: Only Download If You Have Quota*', m);
            await msg.react("✅", m);
            return;
        } else {
            await msg.reply('❌ Failed to get the direct download link.', m);
        }
    } catch (error) {
        console.error('Error fetching direct download link:', error);
        await msg.reply('❗ An error occurred while fetching the direct download link.', m);
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
