require('esm')(module);
require('../Config');
const path = require('path');
const fs = require('fs');

module.exports = (Command) => {
    Command({
        cmd: ['menu'],
        desc: 'Show All Commands',
        react: "📜",
        type: 'BOT COMMANDS',
        handler: async (m, sock, commands) => {
            const BOT_NAME = global.botSettings.botName[0];
            const ownerNumbers = global.botSettings.ownerNumbers[0];
            const ownerName = global.botSettings.ownerName[0];
            const prefix = global.botSettings.botPrefix[0];
            const requestedUserName = m.pushName || "User";
            const requestedUserNumber = m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid;

            const now = new Date();
            const hours = now.getHours();
            let greeting;

            if (hours < 12) {
                greeting = "Good Morning 🌤️";
            } else if (hours < 18) {
                greeting = "Good Afternoon 🌥️";
            } else {
                greeting = "Good Evening 🌑";
            }

            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString();

            // Categorize commands
            const commandTypes = {};
            commands.forEach(command => {
                if (!commandTypes[command.type]) {
                    commandTypes[command.type] = [];
                }
                commandTypes[command.type].push(command);
            });

            // Build beautiful text-based menu
            let menuText = `
╭━━━━━[ *${BOT_NAME}* ]━╮
┃ ✨ Hello, *${requestedUserName}*! ✨
┃ 👋 ${greeting}!

*Need help? Here's what I can do:*
`;

            for (const [type, commandsOfType] of Object.entries(commandTypes)) {
                menuText += `\n ⚜️  *${type}*\n`;
                commandsOfType.forEach(command => {
                    const cmds = Array.isArray(command.cmd) ? command.cmd : [command.cmd];
                    cmds.forEach(cmd => {
                        menuText += `- *\`${prefix}${cmd}\`*\n`;
                    });
                });
            }

            menuText += `
\nTo get more information about a command, type:
\`${prefix}help <command_name>\`

For any questions or issues, feel free to contact the owner:
${ownerName} - ${ownerNumbers} 
╰────────────────
`;

            // Resolve the directory path
            const directoryPath = path.resolve(__dirname, '../Assets/_MenuAssets');

            // Read all files in the directory
            const files = fs.readdirSync(directoryPath);

            // Filter out only image files (you may need to adjust this depending on your file types)
            const imageFiles = files.filter(file => {
                const fileExtension = path.extname(file).toLowerCase();
                return ['.png', '.jpg', '.jpeg', '.gif'].includes(fileExtension);
            });

            // Shuffle the array of image files randomly
            const shuffledFiles = shuffleArray(imageFiles);

            // Choose the first image file from the shuffled array
            const randomImageFile = shuffledFiles[0];

            // Resolve the image path
            const imagePath = path.resolve(directoryPath, randomImageFile);

            // Read the image file into a buffer
            const imageBuffer = fs.readFileSync(imagePath);


            // Send image with text caption
            await sock.sendMessage(m.key.remoteJid, { image: imageBuffer, caption: menuText }, { quoted: m });
        }
    });
};

// Function to shuffle an array randomly
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}