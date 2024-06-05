const axios = require('axios');  // Import Axios for making HTTP requests
const fs = require('fs');
const path = require('path');

module.exports = (Command) => {
  Command({
    cmd: ['spotify', 'music'],
    desc: 'Download Spotify Song With Link/Keyword',
    react: "🎼",
    type: 'DOWNLOAD COMMANDS',
    handler: async (m, sock) => {
      const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
      const [command, ...args] = OriginalText.split(' ');

      if (args.length < 1) {
        await sock.sendMessage(m.key.remoteJid, { text: 'Hey there! To download a SPOTIFY SONG, send ".spotify [Spotify link or song keyword]" ' }, { quoted: m });
        await sock.sendMessage(m.key.remoteJid, { react: { text: "❓", key: m.key } });
        return;
      }

      await sock.sendMessage(m.key.remoteJid, { react: { text: "🔍", key: m.key } });

      const input = args.join(' ');

      try {
        if (input.match(/(https:\/\/www\.spotify\.com\/|https:\/\/open\.spotify\.com\/)/)) {
          const ins = input;
          const result = await axios.get(`https://api.junn4.my.id/download/spotify?url=${ins}`); // Wait for the result of the GET request 
          await sock.sendMessage(m.key.remoteJid, { react: { text: "🔃", key: m.key } });
          const dlLink = result.data.data.download
          const title = result.data.data.title
          await downloadSpotifySong(sock, m, dlLink, title)
        } else {
          const ins = input.replace(/\s+/g, "%20");
          const url = `https://api.junn4.my.id/search/spotify?query=${ins}`

          const result = await axios.get(url); // Wait for the result of the GET request

          const link = result.data.data[0].url
          const title = result.data.data[0].title
          await sock.sendMessage(m.key.remoteJid, { react: { text: "🔃", key: m.key } });
          const result2 = await axios.get(`https://api.junn4.my.id/download/spotify?url=${link}`); // Wait for the result of the GET request 
          const dlLink = result2.data.data.download
          await downloadSpotifySong(sock, m, dlLink, title)
        }
      } catch {

      }
    }
  });
};

async function downloadSpotifySong(sock, m, url, title) {
  try {
    // Create a safe filename by removing invalid characters and converting to lowercase
    const safeTitle = title
      .toLowerCase()
      .normalize("NFD") // Normalize unicode characters for better compatibility
      .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritics (accents, etc.)
      .replace(/[^a-z0-9_]/g, '_') // Replace all non-alphanumeric characters with underscores
      .replace(/__/g, '_'); // Remove consecutive underscores

    await msg.reply("⬇️ Downloading song...", m); // Send downloading indication

    // Check if the "downloads" directory exists, create it if not
    const downloadsDir = path.join(__dirname, 'downloads'); // Assuming your script is in the project root
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

       // Construct the file path within the "downloads" directory
       const filePath = path.join(downloadsDir, `${safeTitle}.mp3`);

       // Download the song
       const response = await axios.get(url, { responseType: 'stream' });
   
       // Create a write stream to save the file
       const writer = fs.createWriteStream(filePath);
   
       // Pipe the response data to the file
       response.data.pipe(writer);
   
       // Wait for the download to finish
       await new Promise((resolve, reject) => {
         writer.on('finish', resolve);
         writer.on('error', reject);
       });
   
       await msg.react("⬆️", m); // Send uploading indication
   
       // Send the downloaded song as an audio document with styled title and caption
       await sock.sendMessage(
         m.key.remoteJid,
         {
           document: fs.readFileSync(filePath),
           mimetype: 'audio/mpeg',
           fileName: `${title}.mp3`, // Set the filename
           caption: `🎵 *${title}* 🎵\n\n🤖 *HACXK MD*` // Set the styled caption
         },
         { quoted: m }
       );
   
       // Remove the downloaded file
       fs.unlinkSync(filePath);
   
       await msg.react("✅", m); // Send success reaction
  } catch (error) {
    console.error('Error downloading song:', error);
    await msg.reply("Error downloading song.", m); // Send error message
  }
}
