require('esm')(module);
require('../Config');
const Jimp = require('jimp');

module.exports = (Command) => {
    Command({
        cmd: ['menu', 'help'],
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
                menuText += `\n*${type}*\n`;
                commandsOfType.forEach(command => {
                    const cmds = Array.isArray(command.cmd) ? command.cmd : [command.cmd];
                    cmds.forEach(cmd => {
                        menuText += `- \`${prefix}${cmd}\` - ${command.desc}\n`;
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


            // Load the image and add the user's name to it
            const imagePath = 'Assets/_MenuAssets/menuImage1.png';
            const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE); // Larger font size
            const image = await Jimp.read(imagePath);

            // Create a gradient background
            const gradient = await new Jimp(image.bitmap.width, image.bitmap.height, (err, img) => {
                if (err) throw err;
                for (let y = 0; y < img.bitmap.height; y++) {
                    const color = Jimp.rgbaToInt(0, 0, 0, (y / img.bitmap.height) * 255);
                    img.scan(0, y, img.bitmap.width, 1, (x, y, idx) => {
                        img.bitmap.data[idx + 0] = (color >> 24) & 0xff;
                        img.bitmap.data[idx + 1] = (color >> 16) & 0xff;
                        img.bitmap.data[idx + 2] = (color >> 8) & 0xff;
                        img.bitmap.data[idx + 3] = color & 0xff;
                    });
                }
            });

            // Composite the gradient over the image
            image.composite(gradient, 0, 0, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 0.5,
                opacityDest: 1
            });

            // Calculate the position to center the text
            const text = `Hello, ${requestedUserName}`;
            const textWidth = Jimp.measureText(font, text);
            const textHeight = Jimp.measureTextHeight(font, text, image.bitmap.width);
            const x = (image.bitmap.width - textWidth) / 2;
            const y = (image.bitmap.height - textHeight) / 2;

            // Print the text with a shadow
            const shadowOffset = 2;
            image.print(font, x + shadowOffset, y + shadowOffset, { text, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, textWidth, textHeight)
                .print(font, x, y, { text, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, textWidth, textHeight);

            // Save the modified image to a buffer
            const buffer = await image.getBufferAsync(Jimp.MIME_PNG);


            await sock.sendMessage(m.key.remoteJid, { image: buffer, caption: menuText }, { quoted: m });
        }
    });
};
