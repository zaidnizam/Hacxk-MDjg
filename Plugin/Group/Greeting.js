const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function greetings(sock, update) {
    const { id, participants, action } = update;
    const metadata = await sock.groupMetadata(id); // Get group metadata

    if (metadata.announce) {
        return;
    }

    if (action === 'add') {
        for (const participant of participants) {
            const Thumbnailurl = await sock.profilePictureUrl(participant, "image");
            const downloadDir = path.join(__dirname, 'downloads');

            // Ensure the download directory exists
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir, { recursive: true });
            }

            // Define the path where the thumbnail will be saved
            const filePath = path.join(downloadDir, `${participant.split('@')[0]}.jpg`);

            // Download and save the profile picture
            try {
                const response = await axios({
                    url: Thumbnailurl,
                    method: 'GET',
                    responseType: 'stream'
                });

                // Save the file
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on('finish', async () => {
                 //   console.log(`Profile picture saved for participant ${participant}`);

                    const mediaMessage = {
                        image: { url: filePath },
                        caption: `🌟 *Welcome to ${metadata.subject}!* 🌟\n\nHey @${participant.split('@')[0]}, we're thrilled to have you here! 🎉\n\nFeel free to introduce yourself and join the conversation! 😊. to start send .menu`,
                        mentions: [participant],
                    };

                    await sock.sendMessage(id, mediaMessage);

                    // Delete the image file after sending
                    fs.unlink(filePath, (err) => {
                        if (err) {
                         //   console.error('Error deleting file:', err);
                        } else {
                          //  console.log(`Deleted file: ${filePath}`);
                        }
                    });
                });

                writer.on('error', (err) => {
                   // console.error('Error writing file:', err);
                });
            } catch (error) {
               // console.error('Error downloading profile picture:', error);
            }
        }
    } else if (action === 'remove') {
        for (const participant of participants) {
            const Thumbnailurl = await sock.profilePictureUrl(participant, "image");
            const downloadDir = path.join(__dirname, 'downloads');
             // Ensure the download directory exists
             if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir, { recursive: true });
            }
            const filePath = path.join(downloadDir, `${participant.split('@')[0]}.jpg`);

            // Download and save the profile picture for the farewell message
            try {
                const response = await axios({
                    url: Thumbnailurl,
                    method: 'GET',
                    responseType: 'stream'
                });

                // Save the file
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on('finish', async () => {
                    const farewellMessage = `😢 *Goodbye @${participant.split('@')[0]}!* \n\nWe hope to see you again in ${metadata.subject}.`;

                    const mediaMessage = {
                        image: { url: filePath },
                        caption: farewellMessage,
                        mentions: [participant],
                    };

                    await sock.sendMessage(id, mediaMessage);

                    // Delete the image file after sending
                    fs.unlink(filePath, (err) => {
                        if (err) {
                     //       console.error('Error deleting file:', err);
                        } else {
                      //      console.log(`Deleted file: ${filePath}`);
                        }
                    });
                });

                writer.on('error', (err) => {
                //    console.error('Error writing file:', err);
                });
            } catch (error) {
               // console.error('Error downloading profile picture:', error);
            }
        }
    }
}

module.exports = { greetings };
