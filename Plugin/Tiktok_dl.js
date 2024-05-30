const tik = require('rahad-media-downloader');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = (Command) => {
    Command({
        cmd: ['tt', 'tiktok', 'tik'],
        desc: 'Download TikTok video/audio',
        react: "🎶",
        type: 'TIKTOK DOWNLOADER COMMANDS',
        handler: async (m, sock) => {
            const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            const [command, ...args] = OriginalText.split(' ');

            if (args.length < 1) {
                await sock.sendMessage(m.key.remoteJid, { text: 'Hey there! To download a video, send ".tt [TikTok link or keyword]" ' }, { quoted: m });
                await sock.sendMessage(m.key.remoteJid, { react: { text: "❓", key: m.key } });
                return;
            }

            await sock.sendMessage(m.key.remoteJid, { react: { text: "🔍", key: m.key } });

            const input = args.join(' ');

            try {
                if (input.match(/(https:\/\/www\.tiktok\.com\/|https:\/\/vm\.tiktok\.com\/)/)) {
                    const result = await tik.rahadtikdl(input);

                    const { metadata, videoDetails } = result;

                    console.log(videoDetails)

                    const {
                        title,
                        react_count,
                        comment_count,
                        share_count,
                        musicInfo,
                        noWatermarkMp4,
                        watermarkMp4,
                        download_count,
                        create_time,
                        avatar,
                    } = videoDetails;

                    const { Author, Facebook } = metadata;

                    const message = `🎶 *TikTok Search Results* 📹\n\n` +
                        `*To Download:*\n` +
                        `> ▶️ To Download Video as HD: Reply with 1\n` +
                        `> ▶️ To Download Video as SD: Reply with 2\n` +
                        `> ▶️ To Download Video as MP3: Reply with 3\n\n` +
                        `🎬 *Title*: ${title}\n` +
                        `❤️ *Likes*: ${react_count}\n` +
                        `💬 *Comments*: ${comment_count}\n` +
                        `🔄 *Shares*: ${share_count}\n` +
                        `🔽 *Downloads*: ${download_count}\n` +
                        `⏰ *Created*: ${new Date(create_time * 1000).toLocaleString()}\n\n` +
                        `🎵 *Music Info* 🎵\n` +
                        `🎶 *Title*: ${musicInfo.title}\n` +
                        `👤 *Author*: ${musicInfo.author}\n` +
                        `⏱️ *Duration*: ${musicInfo.duration}s\n\n` +
                        `🔗 *Video URL*: ${noWatermarkMp4}\n\n` +
                        `👤 *Author Metadata* 👤\n` +
                        `👤 *Name*: ${Author}\n` +
                        `🌐 *Facebook*: ${Facebook}\n` +
                        `🖼️ *Avatar*: ${avatar}`;

                    const sentMessage = await sock.sendMessage(m.key.remoteJid, { text: message, matchedText: input, canonicalUrl: input, previewType: true, thumbnailWidth: 630 }, { quoted: m });
                    await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });
                    const replyHandler = async (msg) => {
                        if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                            const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                            if (replyText === '1') {
                                await sock.sendMessage(m.key.remoteJid, { text: 'Downloading video as HD...' }, { quoted: msg });
                                const url = noWatermarkMp4;
                                await downloadTiktok(sock, m, 'HD', url, title);
                            } else if (replyText === '2') {
                                await sock.sendMessage(m.key.remoteJid, { text: 'Downloading Video as SD...' }, { quoted: msg });
                                const url = watermarkMp4;
                                await downloadTiktok(sock, m, 'SD', url, title);
                            } else if (replyText === '3') {
                                await sock.sendMessage(m.key.remoteJid, { text: 'Downloading audio...' }, { quoted: msg });
                                const url = musicInfo.music;
                                await downloadTiktok(sock, m, 'MP3', url, title);
                            } else {
                                await sock.sendMessage(m.key.remoteJid, { text: 'Invalid option. Send "1" for video or "3" for audio.' }, { quoted: msg });
                            }
                        }
                    };


                    sock.ev.on('messages.upsert', async ({ messages }) => {
                        for (let msg of messages) {
                            await replyHandler(msg);
                        }
                    });
                } else {
                    sock.sendMessage(m.key.remoteJid, { text: `Searching for keyword: ${input}` })
                    const ins = input.replace(/\s+/g, "%20");
                    const url = `https://api.junn4.my.id/search/tiktoksearch?query=${ins}`

                    const result = await axios.get(url); // Wait for the result of the GET request
                
                    const { title, cover, origin_cover, no_watermark, watermark, music } = result.data.result;





                    const message = `
📹 *HACXK MD TIKTOK DOWNLOADER* 📹
       
*Title:* ${title}
       
*Download Video As:*
       
1️⃣ No Watermark
2️⃣ With Watermark
3️⃣ Only Sound`;





                    try {
                        const sentMessages = await sock.sendMessage(m.key.remoteJid, { text: message }, { quoted: m });

                        let responseHandled = false;  // Flag to track if a valid response has been handled

                        const replyHandler = async (msg) => {
                            if (responseHandled) return;  // If a valid response has been handled, skip further processing

                            if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessages.key.id) { // Check if sentMessages is defined
                                const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                                if (replyText === '1') {
                                    responseHandled = true;  // Set the flag
                                    sock.sendMessage(m.key.remoteJid, { text: 'Downloading video with watermark...' }, { quoted: msg });
                                    const url = no_watermark;
                                    const saveDirectory = path.join(__dirname, 'downloads');

                                    if (!fs.existsSync(saveDirectory)) {
                                        fs.mkdirSync(saveDirectory);
                                    }

                                    const formattedTitle = title.toLowerCase().replace(/ /g, '_') + '.mp4';
                                    const filePath = path.join(saveDirectory, formattedTitle);

                                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                                    fs.writeFileSync(filePath, response.data);

                                    await sock.sendMessage(
                                        m.key.remoteJid,
                                        {
                                            video: fs.readFileSync(filePath),
                                            mimetype: 'video/mp4',
                                            height: 1152,
                                            width: 2048,
                                            caption: `*Video Title*: ${title}\n\n𝘏𝘈𝘊𝘟𝘒 𝘔𝘋`
                                        },
                                        { quoted: m }
                                    );

                                    fs.unlinkSync(filePath);
                                    return;
                                } else if (replyText === '2') {
                                    responseHandled = true;  // Set the flag
                                    sock.sendMessage(m.key.remoteJid, { text: 'Downloading video with watermark...' }, { quoted: msg });
                                    const url = watermark;
                                    const saveDirectory = path.join(__dirname, 'downloads');

                                    if (!fs.existsSync(saveDirectory)) {
                                        fs.mkdirSync(saveDirectory);
                                    }

                                    const formattedTitle = title.toLowerCase().replace(/ /g, '_') + '.mp4';
                                    const filePath = path.join(saveDirectory, formattedTitle);

                                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                                    fs.writeFileSync(filePath, response.data);

                                    await sock.sendMessage(
                                        m.key.remoteJid,
                                        {
                                            video: fs.readFileSync(filePath),
                                            mimetype: 'video/mp4',
                                            height: 1152,
                                            width: 2048,
                                            caption: `*Video Title*: ${title}\n\n𝘏𝘈𝘊𝘟𝘒 𝘔𝘋`
                                        },
                                        { quoted: m }
                                    );

                                    fs.unlinkSync(filePath);
                                    return;
                                } else if (replyText === '3') {
                                    responseHandled = true;  // Set the flag
                                    sock.sendMessage(m.key.remoteJid, { text: 'Downloading audio...' }, { quoted: msg });
                                    const url = music;
                                    const saveDirectory = path.join(__dirname, 'downloads');

                                    if (!fs.existsSync(saveDirectory)) {
                                        fs.mkdirSync(saveDirectory);
                                    }

                                    const formattedTitle = title.toLowerCase().replace(/ /g, '_') + '.mp3';
                                    const filePath = path.join(saveDirectory, formattedTitle);

                                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                                    fs.writeFileSync(filePath, response.data);

                                    await sock.sendMessage(
                                        m.key.remoteJid,
                                        {
                                            audio: fs.readFileSync(filePath),
                                            mimetype: 'audio/mpeg'
                                        },
                                        { quoted: m }
                                    );

                                    fs.unlinkSync(filePath);
                                    return;
                                } else {
                                    sock.sendMessage(m.key.remoteJid, { text: 'Invalid option. Send "1" for video or "3" for audio.' }, { quoted: msg });
                                }
                            }
                        };

                        sock.ev.on('messages.upsert', async ({ messages }) => {
                            for (let msg of messages) {
                                await replyHandler(msg);
                            }
                        });

                    } catch (err) {
                        console.error('Error handling replies:', err);
                        sock.sendMessage(m.key.remoteJid, { text: 'An error occurred while handling replies.' }, { quoted: m });
                    }

                }
            } catch (error) {
                console.error('Error occurred:', error);
                await sock.sendMessage(m.key.remoteJid, { text: 'An error occurred while processing your request. Please try again later.' }, { quoted: m });
            }
        }
    });
};

const sanitizeFilename = (filename) => {
    return filename.replace(/[<>:"/\\|?*]+/g, '');
};

async function downloadTiktok(sock, m, option, url, stitle) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await sock.sendMessage(m.key.remoteJid, { react: { text: "⬇️", key: m.key } });
        // Generate filename based on video title
        const title = sanitizeFilename(stitle.toLowerCase().replace(/ /g, '_'));
        const extension = option === 'MP3' ? 'mp3' : 'mp4';
        const filename = `${title}.${extension}`;

        // Determine the directory to save the file
        const saveDirectory = path.join(__dirname, 'downloads');

        // Create the "downloads" folder if it doesn't exist
        if (!fs.existsSync(saveDirectory)) {
            fs.mkdirSync(saveDirectory);
        }

        const filePath = path.join(saveDirectory, filename);

        fs.writeFileSync(filePath, response.data);
        await sock.sendMessage(m.key.remoteJid, { react: { text: "⬆️", key: m.key } });
        if (extension === 'mp4') {
            // Upload the video to the chat
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    video: fs.readFileSync(filePath),
                    mimetype: 'video/mp4',
                    height: 1152,
                    width: 2048,
                    caption: `*Video Title*: ${stitle}\n*Size*: ${Math.round(response.data.length / (1024 * 1024))} MB\n\n𝘏𝘈𝘊𝘟𝘒 𝘔𝘋`
                },
                { quoted: m }
            );
        } else {
            // Upload the audio to the chat
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    audio: fs.readFileSync(filePath),
                    mimetype: 'audio/mpeg'
                },
                { quoted: m }
            );
        }


        await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });

        // Delete the downloaded video file
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting video:', err);
            } else {
                console.log('Video deleted successfully.');
            }
        });

        // await sock.sendMessage(m.key.remoteJid, { text: `Downloaded ${option === 'MP3' ? 'audio' : 'video'} successfully.` }, { quoted: m });
    } catch (error) {
        console.error('Error occurred during download:', error);
        await sock.sendMessage(m.key.remoteJid, { text: 'An error occurred during download. Please try again later.' }, { quoted: m });
    }
}
