const fs = require('fs');
const path = require('path');
require('esm')(module);
require('../../Config');

const commands = [];
let commandPrefix = global.botSettings.botPrefix[0]; // Set your desired command prefix here

function Command({ cmd, desc, react, type, handler }) {
    commands.push({ cmd, desc, react, type, handler });
}

async function handleCommand(m, sock, delay) {
    try {
        const textMessage = m.message?.conversation.toLowerCase() ||
            m.message?.extendedTextMessage?.text.toLowerCase() || "";
        const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";

        const partialCommand = textMessage.split(" ")[0]; // Get the first word (potential partial command)

        // Check if the partialCommand starts with the prefix
        if (partialCommand.startsWith(commandPrefix)) {
            const matchedCommand = commands.find(command => {
                if (Array.isArray(command.cmd)) {
                    return command.cmd.some(cmd => textMessage === commandPrefix + cmd);
                } else {
                    return textMessage.startsWith(commandPrefix + command.cmd);
                }
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
                    return command.cmd.some(cmd => cmd.startsWith(partialCommand.slice(commandPrefix.length)));
                });

                if (similarCommands.length > 0) {
                    const suggestions = similarCommands.map(cmd => commandPrefix + cmd.cmd[0]).join(", ");
                    await sock.sendMessage(m.key.remoteJid, { react: { text: '🧐', key: m.key }})
                    await sock.sendMessage(m.key.remoteJid, {
                        text: `Command not found.🧐 Did you mean: *${suggestions}*?`
                    }, { quoted: m });
                }
            }
        }
    } catch (error) {
        console.error("An error occurred:", error);
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
