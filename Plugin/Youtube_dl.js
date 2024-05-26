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
        cmd: ['yt', 'play', 'ytmp4', 'video', 'song', 'ytmp3', 'ytaudio'],
        desc: 'Download YouTube Video',
        react: "▶️",
        type: 'YT DOWNLOADER COMMANDS',
        handler: async (m, sock) => {
            try {
                const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
                const [command, ...args] = OriginalText.split(' ');

                if (args.length < 1) {
                    await sock.sendMessage(m.key.remoteJid, { text: 'Hey there! To download a video, send ".yt [YouTube link or keyword]" ' }, { quoted: m });
                    return sock.sendMessage(m.key.remoteJid, { react: { text: "❓", key: m.key } });
                }

                await sock.sendMessage(m.key.remoteJid, { react: { text: "🔍", key: m.key } });
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
🔍 *Keywords*: ${keywords.join(', ')}
💽 *Video Size*: ${sizeInMB} MB
`;

                await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });

                const sentMessage = await sock.sendMessage(m.key.remoteJid, { text: mes, title: title, canonicalUrl: video_url, thumbnailWidth: 1280 }, { quoted: m });

                const replyHandler = async (msg) => {
                    if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                        const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                        if (replyText === '1') {
                            await sock.sendMessage(m.key.remoteJid, { text: 'Downloading video...' }, { quoted: msg });
                            await downyt720(sock, m, videoID);
                        } else if (replyText === '2') {
                            await sock.sendMessage(m.key.remoteJid, { text: 'Downloading audio...' }, { quoted: msg });
                            downytaudio(sock, m, videoID)
                        } else {
                            await sock.sendMessage(m.key.remoteJid, { text: 'Invalid option. Send "1" for video or "2" for audio.' }, { quoted: msg });
                        }
                    }
                };

                sock.ev.on('messages.upsert', async ({ messages }) => {
                    for (let msg of messages) {
                        await replyHandler(msg);
                    }
                });

            } catch (error) {
                console.error('Error occurred:', error);
                await sock.sendMessage(m.key.remoteJid, { text: error.message }, { quoted: m });
            }
        }
    });
};


function sanitizeFilename(filename) {
    // Remove invalid characters for Windows file names
    const invalidChars = /[\\/:\*?"<>|]/g;
    return filename.replace(invalidChars, '_');
  }

async function downyt720(sock, message, videoid) {
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

  async function downyt360(sock, message, videoid) {
    try {
      const downloadFolderPath = path.join(__dirname, 'downloads');
      await sock.sendMessage(message.key.remoteJid, { react: { text: '🔍', key: message.key } });
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
        await sock.sendMessage(message.key.remoteJid, { react: { text: '⚠️', key: message.key } });
        await sock.sendMessage(message.key.remoteJid, { text: `Error:  Your Video size is ${sizeInMB} that is over our limit >>200MB, skipping download` }, { quoted: message });
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
  
  async function downytaudio(sock, message, videoid) {
    try {
      const downloadFolderPath = path.join(__dirname, 'downloads');
      await sock.sendMessage(message.key.remoteJid, { react: { text: '🔍', key: message.key } });
      // Create the "downloads" folder if it doesn't exist
      if (!fs.existsSync(downloadFolderPath)) {
        fs.mkdirSync(downloadFolderPath);
      }
      
      const videoInfo = await ytdl.getInfo(videoid);
      const audioFormat = ytdl.filterFormats(videoInfo.formats, 'audioonly').sort((a, b) => b.audioBitrate - a.audioBitrate)[0];
      const audioSize = audioFormat.contentLength; // Get the audio size in bytes
      
      // Check if the audio size is over 200MB
      if (audioSize > 200 * 1024 * 1024) {
        await sock.sendMessage(message.key.remoteJid, { react: { text: '⚠️', key: message.key } });
        await sock.sendMessage(message.key.remoteJid, { text: 'Error: Audio size is over 200MB, skipping download' }, { quoted: message });
        return;
      }
      
      const sizeInMB = (audioSize / (1024 * 1024)).toFixed(2);
      const videoTitle = videoInfo.videoDetails.title;
      const sanitizedVideoTitle = sanitizeFilename(videoTitle);
      const audioFilePath = path.join(downloadFolderPath, `${sanitizedVideoTitle}.${audioFormat.container}`);
      
      await sock.sendMessage(message.key.remoteJid, { react: { text: '⏳', key: message.key } });
      
      const downloadStream = ytdl(videoid, { format: audioFormat });
      const writeStream = fs.createWriteStream(audioFilePath);
      
      downloadStream.pipe(writeStream);
      
      downloadStream.on('end', async () => {
        await sock.sendMessage(message.key.remoteJid, { react: { text: '✅', key: message.key } });
        console.log(`Audio from "${videoTitle}" has been downloaded successfully!`);
        // Upload the audio to the chat
        await sock.sendMessage(
          message.key.remoteJid,
          {
            audio: fs.readFileSync(audioFilePath),
            mimetype: 'audio/mpeg',
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
        await sock.sendMessage(message.key.remoteJid, { react: { text: '❌', key: message.key } });
        console.error('Error downloading YouTube audio:', error);
        await sock.sendMessage(message.key.remoteJid, { text: `Error downloading YouTube audio: ${error.message}` }, { quoted: message });
      });
      } catch (error) {
      await sock.sendMessage(message.key.remoteJid, { react: { text: '❌', key: message.key } });
      console.error('Error downloading YouTube audio:', error);
      await sock.sendMessage(message.key.remoteJid, { text: `Error downloading YouTube audio: ${error.message}` }, { quoted: message });
      }
      }