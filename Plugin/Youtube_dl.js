const ytdl = require('ytdl-core');
const { youtube } = require('scrape-youtube');
const fs = require('fs');
const path = require('path');
require('esm')(module);
require('../Config');

// Function to extract video ID from URL
function getVideoIdFromUrl(link) {
    const match = link.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|v\/|embed\/|watch\?v=))([\w-]{11})/);
    if (match && match[1]) {
        return match[1];
    } else {
        throw new Error('Invalid YouTube URL');
    }
}

module.exports = (Command) => {
    Command({
        cmd: ['yt', 'ytmp4', 'video', 'ytmp3', 'ytaudio'],
        desc: 'Download YouTube Video',
        react: "▶️",
        type: 'DOWNLOAD COMMANDS',
        handler: async (m, sock) => {
            try {
                const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
                const [command, ...args] = OriginalText.split(' ');

                if (args.length < 1) {
                    await msg.reply('Hey there! To download a video, send ".yt [YouTube link or keyword]" ', m);
                    await msg.react("❓", m);
                    return;
                }

                await msg.react("🔍", m);
                const input = args.join(' ');
                let videoID;

                if (input.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|v\/|embed\/|watch\?v=))([\w-]{11})/)) {
                    videoID = getVideoIdFromUrl(input);
                } else {
                    const options = {
                        type: 'video',
                        request: {
                            headers: {
                                Cookie: 'PREF=f2=8000000',
                                'Accept-Language': 'en'
                            }
                        }
                    };
                    const { videos } = await youtube.search(input, options);
                    if (videos.length === 0) {
                        throw new Error('No videos found for the given keyword.');
                    }
                    videoID = getVideoIdFromUrl(videos[0].link);
                }

                const videoInfo = await ytdl.getInfo(videoID);
                const { title, description, lengthSeconds, video_url, ownerChannelName, viewCount, uploadDate, category, keywords } = videoInfo.videoDetails;
                const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo' });
                const sizeInMB = (videoFormat.contentLength / (1024 * 1024)).toFixed(2);
                const limitedDescription = description.length > 50 ? description.substring(0, 50) + '...' : description;

                const botName = global.botSettings.botName[0];

                const mes = `
-------✧*̥˚ ${botName} YT DOWNLOADER*̥˚✧

*TO DOWNLOAD SEND REPLY TO THIS MESSAGE*

> ⬇️ Download As 📹 Video Send: | *1*
> ⬇️ Download As 🎶 Audio Send: | *2*

🏷️ *Title*: ${title}
📝 *Description*: ${limitedDescription || description}
⏳ *Length*: ${lengthSeconds} seconds
🔗 *URL*: ${video_url}
📺 *Channel*: ${ownerChannelName}
👀 *View Count*: ${viewCount}
📅 *Upload Date*: ${uploadDate}
📚 *Category*: ${category}
💽 *Video Size*: ${sizeInMB} MB
`;

                await msg.react("✅", m);

                const sentMessage = await msg.reply(mes, m);

                const replyHandler = async ({ messages }) => {
                    const msg = messages[0];
                    if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                        const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                        if (replyText === '1') {
                            await sock.ev.off('messages.upsert', replyHandler);
                            await msg.reply('Downloading video...', msg);
                            await downyt360(sock, m, videoID);
                        } else if (replyText === '2') {
                            await sock.ev.off('messages.upsert', replyHandler);
                            await msg.reply('Downloading audio...', msg);
                            await downytaudio(sock, m, videoID);
                        } else {
                            await msg.reply('Invalid option. Send "1" for video or "2" for audio.', msg);
                        }
                    }
                };

                // Attach the event listener
                sock.ev.on('messages.upsert', replyHandler);

            } catch (error) {
                console.error('Error occurred:', error);
                await msg.reply(error.message, m);
            }
        }
    }),
        Command({
            cmd: ['song', 'play'],
            desc: 'Download YouTube Video as Audio',
            react: "🎤",
            type: 'DOWNLOAD COMMANDS',
            handler: async (m, sock) => {
                try {
                    const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
                    const [command, ...args] = OriginalText.split(' ');

                    if (args.length < 1) {
                        await msg.reply('Hey there! To download a Audio, send ".song [keyword]" ', m);
                        await msg.react("❓", m);
                        return;
                    }

                    await msg.react("🔍", m);
                    const input = args.join(' ');
                    let videoID;

                    if (input.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|v\/|embed\/|watch\?v=))([\w-]{11})/)) {
                        videoID = getVideoIdFromUrl(input);
                    } else {
                        const options = {
                            type: 'video',
                            request: {
                                headers: {
                                    Cookie: 'PREF=f2=8000000',
                                    'Accept-Language': 'en'
                                }
                            }
                        };
                        const { videos } = await youtube.search('song' + input, options);
                        if (videos.length === 0) {
                            throw new Error('No videos found for the given keyword.');
                        }
                        videoID = getVideoIdFromUrl(videos[0].link);
                    }

                    const videoInfo = await ytdl.getInfo(videoID);
                    const { title, description, lengthSeconds, video_url, ownerChannelName, viewCount, uploadDate, category, keywords } = videoInfo.videoDetails;
                    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo' });
                    const sizeInMB = (videoFormat.contentLength / (1024 * 1024)).toFixed(2);
                    const limitedDescription = description.length > 50 ? description.substring(0, 50) + '...' : description || undefined;

                    const botName = global.botSettings.botName[0];

                    const mes = `
-------✧*̥˚ ${botName} YT DOWNLOADER*̥˚✧

🏷️ *Title*: ${title}
📝 *Description*: ${limitedDescription || description}
⏳ *Length*: ${lengthSeconds} seconds
🔗 *URL*: ${video_url}
📺 *Channel*: ${ownerChannelName}
👀 *View Count*: ${viewCount}
📅 *Upload Date*: ${uploadDate}
📚 *Category*: ${category}
💽 *Video Size*: ${sizeInMB} MB
`;

                    await msg.react("✅", m);


                    await downytaudio2(sock, m, videoID, mes);



                } catch (error) {
                    console.error('Error occurred:', error);
                    await msg.reply(error.message, m);
                }
            }
        });
};

function sanitizeFilename(filename) {
    // Remove invalid characters for Windows file names
    const invalidChars = /[\\/:\*?"<>|]/g;
    return filename.replace(invalidChars, '_');
}

async function downyt720(sock, message, videoid, video_url) {
    try {

        const downloadFolderPath = path.join(__dirname, 'downloads');

        // Create the "downloads" folder if it doesn't exist
        if (!fs.existsSync(downloadFolderPath)) {
            fs.mkdirSync(downloadFolderPath);
        }
        await sock.sendMessage(message.key.remoteJid, { text: '⚠️ Warning: Sometimes the video does not support audio (no sound in the video)!' }, { quoted: message });
        const videoInfo = await ytdl.getInfo(videoid);
        const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo' });
        const videoSize = videoFormat.contentLength; // Get the video size in bytes
        const sizeInMB = (videoSize / (1024 * 1024)).toFixed(2);

        // Check if the video size is over 200MB
        if (videoSize > 200 * 1024 * 1024) {
            await sock.sendMessage(message.key.remoteJid, { react: { text: '⚠️', key: message.key } });
            await sock.sendMessage(message.key.remoteJid, { text: `Error:  Your Video size is ${sizeInMB} that is over our limit >>200MB, tryin to download id SD quality` }, { quoted: message });
            await downyt360(sock, message, videoid)
            return;
        }

        const videoTitle = videoInfo.videoDetails.title;
        const sanitizedVideoTitle = sanitizeFilename(videoTitle);
        const videoFilePath = path.join(downloadFolderPath, `${sanitizedVideoTitle}.${videoFormat.container}`);

        await sock.sendMessage(message.key.remoteJid, { react: { text: '⏳', key: message.key } });

        const downloadStream = ytdl(videoid, { format: videoFormat });
        const writeStream = fs.createWriteStream(videoFilePath);

        downloadStream.pipe(writeStream);

        downloadStream.on('end', async () => {
            await sock.sendMessage(message.key.remoteJid, { react: { text: '✅', key: message.key } });
            console.log(`Video "${videoTitle}" has been downloaded successfully!`);
            // Upload the video to the chat
            await sock.sendMessage(
                message.key.remoteJid,
                {
                    video: fs.readFileSync(videoFilePath),
                    mimetype: 'video/mp4',
                    height: 1152,
                    width: 2048,
                    caption: `*Video Title*: ${videoTitle}\n*Size*: ${sizeInMB} MB\n\n𝘏𝘈𝘊𝘟𝘒 𝘔𝘋`
                },
                { quoted: message }
            );

            // Delete the downloaded video file
            fs.unlink(videoFilePath, (err) => {
                if (err) {
                    console.error('Error deleting video:', err);
                } else {
                    console.log('Video deleted successfully.');
                }
            });
        });

        downloadStream.on('error', async (error) => {
            await sock.sendMessage(message.key.remoteJid, { react: { text: '❌', key: message.key } });
            console.error('Error downloading YouTube video:', error);
            await sock.sendMessage(message.key.remoteJid, { text: `Error downloading YouTube video: ${error.message}` }, { quoted: message });
        });
    } catch (error) {
        await sock.sendMessage(message.key.remoteJid, { react: { text: '❌', key: message.key } });
        console.error('Error downloading YouTube video:', error);
        await sock.sendMessage(message.key.remoteJid, { text: `Error downloading YouTube video: ${error.message}` }, { quoted: message });
    }
}

// Sanitize filename by replacing invalid characters
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
}

async function downyt360(sock, message, videoid) {
    try {
        const downloadFolderPath = path.join(__dirname, 'downloads');
        await msg.react('🔍', message);

        // Create the "downloads" folder if it doesn't exist
        if (!fs.existsSync(downloadFolderPath)) {
            fs.mkdirSync(downloadFolderPath);
        }

        const videoInfo = await ytdl.getInfo(videoid);
        const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'lowestvideo' });
        const videoSize = videoFormat.contentLength; // Get the video size in bytes
        const sizeInMB = (videoSize / (1024 * 1024)).toFixed(2);

        // Check if the video size is over 200MB
        if (videoSize > 200 * 1024 * 1024) {
            await msg.react('⚠️', message);
            await msg.reply(`Error: Your video size is ${sizeInMB} MB, which is over our limit of 200 MB, skipping download.`, message);
            return;
        }

        const videoTitle = videoInfo.videoDetails.title;
        const sanitizedVideoTitle = sanitizeFilename(videoTitle);
        const videoFilePath = path.join(downloadFolderPath, `${sanitizedVideoTitle}.${videoFormat.container}`);

        await msg.react('⏳', message);

        const downloadStream = ytdl(videoid, { format: videoFormat });
        const writeStream = fs.createWriteStream(videoFilePath);

        downloadStream.pipe(writeStream);

        downloadStream.on('end', async () => {
            await msg.react('✅', message);
            console.log(`Video "${videoTitle}" has been downloaded successfully!`);

            // Upload the video to the chat
            await sock.sendMessage(
                message.key.remoteJid,
                {
                    video: fs.readFileSync(videoFilePath),
                    mimetype: 'video/mp4',
                    height: 360, // set to a more common 360p height
                    width: 640, // corresponding 360p width
                    caption: `Video Title: ${videoTitle}\nSize: ${sizeInMB} MB\n\n𝘏𝘈𝘊𝘟𝘒 𝘔𝘋`
                },
                { quoted: message }
            );

            // Delete the downloaded video file
            fs.unlink(videoFilePath, (err) => {
                if (err) {
                    console.error('Error deleting video:', err);
                } else {
                    console.log('Video deleted successfully.');
                }
            });
        });

        downloadStream.on('error', async (error) => {
            await msg.react('❌', message);
            console.error('Error downloading YouTube video:', error);
            await msg.reply(`Error downloading YouTube video: ${error.message}`, message);
        });
    } catch (error) {
        await msg.react('❌', message);
        console.error('Error downloading YouTube video:', error);
        await msg.reply(`Error downloading YouTube video: ${error.message}`, message);
    }
}



async function downytaudio(sock, message, videoid) {
    try {
        const downloadFolderPath = path.join(__dirname, 'downloads');
        await msg.react('🔍', message);

        // Create the "downloads" folder if it doesn't exist
        if (!fs.existsSync(downloadFolderPath)) {
            fs.mkdirSync(downloadFolderPath);
        }

        const videoInfo = await ytdl.getInfo(videoid);
        const audioFormat = ytdl.filterFormats(videoInfo.formats, 'audioonly').sort((a, b) => b.audioBitrate - a.audioBitrate)[0];
        const audioSize = audioFormat.contentLength; // Get the audio size in bytes

        // Check if the audio size is over 200MB
        if (audioSize > 200 * 1024 * 1024) {
            await msg.react('⚠️', message);
            await msg.reply('Error: Audio size is over 200MB, skipping download', message);
            return;
        }

        const sizeInMB = (audioSize / (1024 * 1024)).toFixed(2);
        const videoTitle = videoInfo.videoDetails.title;
        const sanitizedVideoTitle = sanitizeFilename(videoTitle);
        const audioFilePath = path.join(downloadFolderPath, `${sanitizedVideoTitle}.${audioFormat.container}`);

        await msg.react('⏳', message);

        const downloadStream = ytdl(videoid, { format: audioFormat });
        const writeStream = fs.createWriteStream(audioFilePath);

        downloadStream.pipe(writeStream);

        downloadStream.on('end', async () => {
            await msg.react('✅', message);
            console.log(`Audio from "${videoTitle}" has been downloaded successfully!`);

            // Upload the audio to the chat as a document
            await sock.sendMessage(
                message.key.remoteJid,
                {
                    document: fs.readFileSync(audioFilePath),
                    mimetype: 'audio/mpeg',
                    fileName: `${videoTitle}.${audioFormat.container}`,
                    caption: `Audio Title: ${videoTitle}\nSize: ${sizeInMB} MB\n\n𝘏𝘈𝘊𝘟𝘒 𝘔𝘋`
                },
                { quoted: message }
            );

            // Delete the downloaded audio file
            fs.unlink(audioFilePath, (err) => {
                if (err) {
                    console.error('Error deleting audio:', err);
                } else {
                    console.log('Audio deleted successfully.');
                }
            });
        });

        downloadStream.on('error', async (error) => {
            await msg.react('❌', message);
            console.error('Error downloading YouTube audio:', error);
            await msg.reply(`Error downloading YouTube audio: ${error.message}`, message);
        });
    } catch (error) {
        await msg.react('❌', message);
        console.error('Error downloading YouTube audio:', error);
        await msg.reply(`Error downloading YouTube audio: ${error.message}`, message);
    }
}


async function downytaudio2(sock, message, videoid, caption) {
    try {
        const downloadFolderPath = path.join(__dirname, 'downloads');
        await msg.react('🔍', message);

        // Create the "downloads" folder if it doesn't exist
        if (!fs.existsSync(downloadFolderPath)) {
            fs.mkdirSync(downloadFolderPath);
        }

        const videoInfo = await ytdl.getInfo(videoid);
        const audioFormat = ytdl.filterFormats(videoInfo.formats, 'audioonly').sort((a, b) => b.audioBitrate - a.audioBitrate)[0];
        const audioSize = audioFormat.contentLength; // Get the audio size in bytes

        // Check if the audio size is over 200MB
        if (audioSize > 200 * 1024 * 1024) {
            await msg.react('⚠️', message);
            await msg.reply('Error: Audio size is over 200MB, skipping download', message);
            return;
        }

        const sizeInMB = (audioSize / (1024 * 1024)).toFixed(2);
        const videoTitle = videoInfo.videoDetails.title;
        const sanitizedVideoTitle = sanitizeFilename(videoTitle);
        const audioFilePath = path.join(downloadFolderPath, `${sanitizedVideoTitle}.${audioFormat.container}`);

        await msg.react('⏳', message);

        const downloadStream = ytdl(videoid, { format: audioFormat });
        const writeStream = fs.createWriteStream(audioFilePath);

        downloadStream.pipe(writeStream);

        downloadStream.on('end', async () => {
            await msg.react('✅', message);
            console.log(`Audio from "${videoTitle}" has been downloaded successfully!`);

            // Upload the audio to the chat as a document
            await sock.sendMessage(
                message.key.remoteJid,
                {
                    document: fs.readFileSync(audioFilePath),
                    mimetype: 'audio/mpeg',
                    fileName: `${videoTitle}.${audioFormat.container}`,
                    caption: `${caption}\n\n𝘏𝘈𝘊𝘟𝘒 𝘔𝘋`
                },
                { quoted: message }
            );

            // Delete the downloaded audio file
            fs.unlink(audioFilePath, (err) => {
                if (err) {
                    console.error('Error deleting audio:', err);
                } else {
                    console.log('Audio deleted successfully.');
                }
            });
        });

        downloadStream.on('error', async (error) => {
            await msg.react('❌', message);
            console.error('Error downloading YouTube audio:', error);
            await msg.reply(`Error downloading YouTube audio: ${error.message}`, message);
        });
    } catch (error) {
        await msg.react('❌', message);
        console.error('Error downloading YouTube audio:', error);
        await msg.reply(`Error downloading YouTube audio: ${error.message}`, message);
    }
}