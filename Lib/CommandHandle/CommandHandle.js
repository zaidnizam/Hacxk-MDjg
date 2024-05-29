const fs = require('fs');
const path = require('path');
require('esm')(module);
require('../../Config');

const commands = [];
let commandPrefix = global.botSettings.botPrefix[0];

function Command({ cmd, desc, react, type, handler }) {
    commands.push({ cmd, desc, react, type, handler });
}

async function handleCommand(m, sock, delay) {
    try {
        const textMessage = m.message?.conversation.toLowerCase() ||
            m.message?.extendedTextMessage?.text.toLowerCase() || "";
        const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";

        const partialCommand = textMessage.split(" ")[0];

        if (partialCommand.startsWith(commandPrefix)) {
            const matchedCommand = commands.find(command => {
                // Ensure command.cmd is an array before using .some()
                const cmdArray = Array.isArray(command.cmd) ? command.cmd : [command.cmd];
        
                return cmdArray.some(cmd => partialCommand === commandPrefix + cmd);
            });  

            if (matchedCommand) {
                await sock.presenceSubscribe(m.key.remoteJid);
                await delay(250);
                await sock.readMessages([m.key]);
                if (matchedCommand.react) {
                    await sock.sendMessage(m.key.remoteJid, { react: { text: matchedCommand.react, key: m.key } });
                }
                await sock.sendPresenceUpdate('composing', m.key.remoteJid);
                await delay(750);
                await sock.sendPresenceUpdate('paused', m.key.remoteJid);
                await matchedCommand.handler(m, sock, commands);
            } else {
                // Command not found, provide suggestions
                const similarCommands = commands.filter(command => {
                    const cmdArray = Array.isArray(command.cmd) ? command.cmd : [command.cmd];
                    return cmdArray.some(cmd => cmd.startsWith(partialCommand.slice(commandPrefix.length)));
                });

                if (similarCommands.length > 0) {
                    const suggestions = similarCommands.map(cmd => commandPrefix + cmd.cmd[0]).join(", ");
                    await sock.sendMessage(m.key.remoteJid, { react: { text: '🧐', key: m.key } })
                    await sock.sendMessage(m.key.remoteJid, {
                        text: `Command not found.🧐 Did you mean: *${suggestions}*?`
                    }, { quoted: m });
                }
            }
        }
    } catch (error) {
        // 1. Log the Error for Debugging
        console.error("Error handling command:", error); // Detailed error for your reference

        // 2. Handle Specific Error Types
        if (error.name === 'BaileysError') {  // Example Baileys library specific error
            // Handle Baileys-related errors (e.g., network issues)
            console.error("BaileysError:", error.message);
            await sock.sendMessage(m.key.remoteJid, { 
                text: "An error occurred while processing your request. Please try again later." 
            }, { quoted: m });
        } else if (error instanceof TypeError) { // Check if it's a type error (e.g., incorrect argument type)
            console.error("TypeError:", error.message);
            await sock.sendMessage(m.key.remoteJid, { 
                text: "Invalid command usage. Please check the command format." 
            }, { quoted: m });
        } else {
            // 3. General Error Handling
            console.error("General Error:", error.message);
            await sock.sendMessage(m.key.remoteJid, { 
                text: "An unexpected error occurred. Please contact the bot owner." 
            }, { quoted: m });
        }

        // 4. Optional: Report Error to Bot Owner 
        // You could send the error details to your own WhatsApp number or a logging service
    }
}

// Function to load all commands from the Plugin folder
async function loadCommandsFromFolder(folderPath) {
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        let loadedCount = 0;
        const totalFiles = commandFiles.length;
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const commandModule = require(filePath); // Use require synchronously
            if (typeof commandModule === 'function') {
                commandModule(Command);
                loadedCount++;
                const percentage = ((loadedCount / totalFiles) * 100).toFixed(0);
                // ANSI escape codes for green color and bold style
                const greenBold = '\x1b[32;1m';
                // Reset ANSI escape code
                const reset = '\x1b[0m';
                // Emoji
                const emoji = '📂'; // You can choose any emoji you like
                console.log(`${greenBold}${emoji} Loaded percentage: ${percentage}% (${loadedCount}/${totalFiles}) ${reset}`);
            }
        }
}

module.exports = { Command, handleCommand, loadCommandsFromFolder, commands };
