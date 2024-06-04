const axios = require('axios');
const fs = require('fs');
const path = require('path');
const humanizeDuration = require('humanize-duration');

let isDownloading = false; // Track if a download is already in progress
let remainingTime = 0; // Track the remaining time if a download is in progress

module.exports = (Command) => {
    Command({
        cmd: ['directdl'],
        desc: 'to download a direct link content (Only Admin)',
        react: "⬇️",
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            const { remoteJid } = m.key;
            const args = m.message?.conversation.split(' ').slice(1).join(' ') || m.message?.extendedTextMessage?.text.split(' ').slice(1).join(' ');
            const sizeLimit = global.botSettings.directDlLimitinMB[0];
       

            if (!args) {
                await msg.reply('Please provide a direct download link to download the content. Example: `directdl [Direct Content Link]`', m);
                await msg.react('🚫', m);
                return;
            }

            if (isDownloading) {
                // If download is in progress, inform the user and suggest trying again after the remaining time
                await msg.reply(`A download is already in progress. Please try again after *${humanizeDuration(remainingTime)}*`, m);
                return;
            }

            try {
                // Set downloading flag to true
                isDownloading = true;
  // Start downloading the file
  const downloadPath = path.resolve(__dirname, 'downloads', path.basename(args));
  if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }
                // Fetch the header to get the file size
                const headResponse = await axios.head(args);
                const contentLength = headResponse.headers['content-length'];
                const fileSizeInMB = parseInt(contentLength, 10) / (1024 * 1024);

                if (fileSizeInMB > sizeLimit) {
                    await msg.reply(`The file size exceeds the limit of ${sizeLimit} MB.`, m);
                    await msg.react('🚫', m);
                    return;
                }
                await msg.react('📤', m);

              
                const writer = fs.createWriteStream(downloadPath);
                const response = await axios({
                    method: 'get',
                    url: args,
                    responseType: 'stream'
                });

                const totalLength = parseInt(response.headers['content-length'], 10);
                let downloadedLength = 0;
                let startTime = Date.now();

                response.data.on('data', (chunk) => {
                    downloadedLength += chunk.length;
                });

                response.data.pipe(writer);

                let lastPercentage = 0;
                const sntmsg = await msg.reply(`Downloaded: 0%`, m);

                const interval = setInterval(async () => {
                    const percentage = ((downloadedLength / totalLength) * 100).toFixed(2);
                    const elapsedTime = Date.now() - startTime;
                    const estimatedTotalTime = (elapsedTime / downloadedLength) * totalLength;
                    remainingTime = estimatedTotalTime - elapsedTime;

                    if (percentage !== lastPercentage) {
                        lastPercentage = percentage;

                        const betmsg = `
✨ *HACXK MD DOWNLOADER* ✨
                        
⏳ *Time Remaining:* ${humanizeDuration(remainingTime)}
📁 *Full Size:* ${(fileSizeInMB).toFixed(2)} MB
📄 *Type:* ${response.headers['content-type']}
⬇️ *Downloaded Percentage:* ${percentage}%
                        `;
                        await msg.edit(sntmsg, betmsg, m);
                    }
                }, 7500);

                writer.on('finish', async () => {
                    clearInterval(interval);
                    await msg.reply('Download complete.', m);
                    await msg.react('✅', m);

                    // Send the downloaded file
                    await sock.sendMessage(m.key.remoteJid, {
                        document: { url: downloadPath },
                        mimetype: response.headers['content-type'],
                        title: path.basename(downloadPath),
                        fileName: path.basename(downloadPath)
                    });

                    // Uninstall the downloaded file
                    fs.unlinkSync(downloadPath);

                    // Set downloading flag to false
                    isDownloading = false;
                });

                writer.on('error', async (err) => {
                    clearInterval(interval);
                    await msg.reply('Error downloading the file.', m);
                    await msg.react('🚫', m);

                    // Set downloading flag to false
                    isDownloading = false;
                });

            } catch (error) {
                await msg.reply('Failed to fetch the file. Please ensure the link is correct and try again.' + error, m);
                await msg.react('🚫', m);
                console.log(error)

                // Set downloading flag to false
                isDownloading = false;
            }
        }
    });
};
