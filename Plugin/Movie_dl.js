const { SinhalaSub } = require('@sl-code-lords/movie-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = (Command) => {
    Command({
        cmd: ['movie', 'film'],
        desc: 'Search for and download movies from SinhalaSub.lk (optional filters: year, genre, language)',
        react: "🎬",
        type: 'MEDIA COMMANDS',
        handler: async (m, sock) => {
            let args = [];

            if (m.message?.extendedTextMessage?.text) {
                args = m.message.extendedTextMessage.text.split(/ +/);
            } else if (m.message?.conversation) {
                args = m.message.conversation.split(/ +/);
            }

            // Remove the command itself from the args array
            args.shift();

            let query = args.join(" ");
            let filterType = null;
            let filterValue = null;

            if (!args.length) {
                await sock.sendMessage(m.key.remoteJid, { text: "Please provide a movie name to search." }, { quoted: m });
                return;
            }

            if (args.length >= 3 && typeof args[0] === 'string' && ['year', 'genre', 'language'].includes(args[0].toLowerCase())) {
                filterType = args[0].toLowerCase();
                filterValue = args.slice(1).join(" ");
                query = "";
            }

            try {
                await sendWithReaction(sock, m.key.remoteJid, '🔍', "Searching for movies...", m);
                const list = await getMovieList(filterType, filterValue, query);
                if (!list.status) {
                    throw new Error("Movie not found. 😞");
                }

                const top10Movies = list.results.slice(0, 10);
                const movieChoices = top10Movies.map((result, index) => `*${index + 1}*. ${result.title} (${result.type === 'movies' ? '🎥' : '📺'})`).join("\n");

                const sentMessage = await sendWithReaction(sock, m.key.remoteJid, '🍿',
                    `Here are the top 10 results:\n\n${movieChoices}\n\nPlease select the movie number you want.`, m);

                const selectedMovieIndex = await getUserResponse(m, sock, sentMessage, 1, 10);
                const selectedMovie = top10Movies[selectedMovieIndex - 1];

                await sendWithReaction(sock, m.key.remoteJid, '🍿', `You selected: *${selectedMovie.title}*`, m);
                const movieDetails = await SinhalaSub.movie(selectedMovie.link);
                if (!movieDetails.status) {
                    throw new Error("Error fetching movie details. 😕");
                }

                const downloadChoices = movieDetails.result.dl_links.map((link, index) => `*${index + 1}*. ${link.quality} (${link.size})`).join("\n");
                const sentDownloadMessage = await sendWithReaction(sock, m.key.remoteJid, '⬇️',
                    `Download Options for *${movieDetails.result.title}*:\n\n${downloadChoices}\n\nPlease select the download option number.`, m);

                const selectedDownloadIndex = await getUserResponse(m, sock, sentDownloadMessage, 1, movieDetails.result.dl_links.length);
                const selectedDownload = movieDetails.result.dl_links[selectedDownloadIndex - 1];

                // Get direct download link and check size before downloading
                const response = await axios.head(selectedDownload.link);
                const directDownloadLink = response.request.res.responseUrl;
                const fileSizeBytes = parseInt(response.headers['content-length'], 10);
                const maxFileSizeMB = 1800;

                if (fileSizeBytes / (1024 * 1024) > maxFileSizeMB) {
                    await sendWithReaction(sock, m.key.remoteJid, '🚫', `File size (${formatBytes(fileSizeBytes)}) exceeds limit of ${maxFileSizeMB} MB.`, m);
                    return;
                }

                const downloadConfirmationMessage = await sendWithReaction(sock, m.key.remoteJid, '❓',
                    `You chose: *${selectedDownload.quality}* for *${movieDetails.result.title}*.\n\nDo you want to download?\n1. Yes\n2. No`, m);

                const downloadChoice = await getUserResponse(m, sock, downloadConfirmationMessage, 1, 2);

                if (downloadChoice === 1) {
                    await sendWithReaction(sock, m.key.remoteJid, '📥', `Downloading *${selectedDownload.quality}* of *${movieDetails.result.title}*\n\nThis might take a while...`, m);

                    const downloadFolder = path.join(__dirname, 'Downloads');
                    if (!fs.existsSync(downloadFolder)) {
                        fs.mkdirSync(downloadFolder, { recursive: true }); // Create if it doesn't exist
                    }

                    const fileName = `${movieDetails.result.title.replace(/[^a-zA-Z0-9\s]/g, '')} - ${selectedDownload.quality}.mp4`;
                    const filePath = path.join(downloadFolder, fileName);

                    const writer = fs.createWriteStream(filePath);
                    const response = await axios({
                        url: directDownloadLink,
                        method: 'GET',
                        responseType: 'stream'
                    });

                    response.data.pipe(writer);

                    new Promise((resolve, reject) => {
                        writer.on('finish', () => {
                            sendWithReaction(sock, m.key.remoteJid, '✅', `Downloaded *${movieDetails.result.title}* successfully!`, m);
                            resolve();
                        });
                        writer.on('error', reject);
                    });

                    return await new Promise((resolve, reject) => {
                        writer.on('finish', async () => {
                            await sock.sendMessage(m.key.remoteJid, {
                                document: { url: filePath },
                                mimetype: 'video/mp4',
                                fileName: fileName,
                                caption: `Here's your movie: *${movieDetails.result.title}* (*${formatBytes(fileSizeBytes)}*)`
                            });
                            fs.unlinkSync(filePath); // Delete the file after sending
                            resolve();
                        })
                    })

                } else {
                    await sendWithReaction(sock, m.key.remoteJid, '🚫', "Download cancelled.", m);
                }
            } catch (error) {
                console.error("Error:", error.message);
                await sendWithReaction(sock, m.key.remoteJid, '❌', `Error: ${error.message}`, m);
            }
        }
    });
};

// Helper function to get movie list (extracted for better organization)
async function getMovieList(filterType, filterValue, query) {
    if (filterType === 'year') {
        return SinhalaSub.get_list.by_year(filterValue, 1);
    } else if (filterType) {
        const filterMethod = SinhalaSub.get_list.by_genre[filterValue] || SinhalaSub.get_list.by_language[filterValue]; // Fixed typo here
        if (!filterMethod) {
            throw new Error(`Invalid ${filterType}.`);
        }
        return filterMethod(1);
    } else {
        return SinhalaSub.get_list.by_search(query);
    }
}


// Helper function to get user response
async function getUserResponse(m, sock, sentMessage, min, max) {
    return new Promise((resolve, reject) => {
        const replyHandler = async (msg) => {
            if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                const selectedOption = parseInt(replyText);
                if (selectedOption >= min && selectedOption <= max) {
                    resolve(selectedOption);
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

// Helper function to format bytes to human-readable string
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper function to send a message with a reaction and WhatsApp font hacks
async function sendWithReaction(sock, remoteJid, reaction, text, m) {
    const formattedText = text
        .replace(/\*(.+?)\*/g, "*$1*")   // Bold
        .replace(/_(.+?)_/g, "_$1_")    // Italics
        .replace(/~(.+?)~/g, "~$1~");  // Strikethrough

    await sock.sendMessage(remoteJid, { react: { text: reaction, key: m.key } });
    return sock.sendMessage(remoteJid, { text: formattedText }, { quoted: m });
}
