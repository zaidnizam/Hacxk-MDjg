const fs = require('fs');
const path = require('path');
require('../../Config')

const commands = [];
const commandPrefixes = global.botSettings.botPrefix; // An array of prefixes

// Command Decorator (Unchanged)
function Command({ cmd, desc, react, type, handler }) {
    const cmdArray = Array.isArray(cmd) ? cmd : [cmd];
    commands.push({ cmd: cmdArray, desc, react, type, handler });
}

// Enhanced Handle Command Function
async function handleCommand(m, sock, delay) {
    try {
        const textMessage = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").toLowerCase().trim();

        // Extract Potential Command and Argument from Input
        let potentialCommand;
        let matchedPrefix;

        // Identify the prefix used and extract the potential command
        for (let prefix of commandPrefixes) {
            if (textMessage.startsWith(prefix)) {
                potentialCommand = textMessage.substring(prefix.length).trim().split(" ")[0];
                matchedPrefix = prefix;
                break;
            }
        }

        if (!potentialCommand) {
            return; // No valid command prefix found
        }

        let args = textMessage.substring(matchedPrefix.length).trim().split(" ");

        // Check if it's in the format ".command -h"
        if (args.length === 2 && args[1] === "-h") {
            const matchedCommand = commands.find(command => command.cmd.includes(potentialCommand));
            if (matchedCommand) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: `Command: ${matchedPrefix}${potentialCommand}\nDescription: ${matchedCommand.desc}`
                }, { quoted: m });
                return;
            } else {
                await sock.sendMessage(m.key.remoteJid, { text: "Command not found." }, { quoted: m });
                return;
            }
        } else {
            // If not in the specific format, proceed with normal command handling

            const partialCommand = potentialCommand;

            if (matchedPrefix) {
                // Find the matched command
                const matchedCommand = commands.find(command =>
                    command.cmd.some(cmd => partialCommand === cmd)
                );

                if (matchedCommand) {
                    // Acknowledge, send typing indicators, and execute
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
                    // Handle similar command suggestions
                    const similarCommands = commands.filter(command =>
                        command.cmd.some(cmd => cmd.startsWith(partialCommand))
                    );
                    if (similarCommands.length > 0) {
                        const suggestions = similarCommands.map(cmd => matchedPrefix + cmd.cmd[0]).join(", ");
                        await sock.sendMessage(m.key.remoteJid, { react: { text: '🧐', key: m.key } });
                        await sock.sendMessage(m.key.remoteJid, {
                            text: `Command not found.🧐 Did you mean: *${suggestions}*?`
                        }, { quoted: m });
                    }
                }
            }
        }
    } catch (error) {
        // Enhanced Error Handling
        console.error("Error handling command:", error);

        // Error-specific handling (examples)
        if (error.name === 'BaileysError') {
            console.error("BaileysError:", error.message);
            // ... (handle Baileys errors, e.g., try to reconnect)
        } else if (error instanceof TypeError) {
            console.error("TypeError:", error.message);
            // ... (handle type errors, e.g., invalid argument types)
        } else {
            console.error("General Error:", error.message);
            // ... (handle other errors, e.g., log to a file)
        }

        // Notify the user
        await sock.sendMessage(m.key.remoteJid, {
            text: "An error occurred while processing your command."
        }, { quoted: m });
    }
}


// Load Commands from Folder (Improved)
async function loadCommandsFromFolder(folderPath) {
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    let loadedCount = 0;
    const totalFiles = commandFiles.length;

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const commandModule = require(filePath);

        if (typeof commandModule === 'function') {
            commandModule(Command);
            loadedCount++;

            // Progress Reporting
            const percentage = ((loadedCount / totalFiles) * 100).toFixed(0);
            console.log(`\x1b[32;1m📂 Loaded percentage: ${percentage}% (${loadedCount}/${totalFiles})\x1b[0m`); // Green and bold
        }
    }
}


module.exports = { Command, handleCommand, loadCommandsFromFolder, commands };
