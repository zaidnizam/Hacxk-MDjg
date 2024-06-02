const path = require('path');
const fs = require('fs');

module.exports = (Command) => {
    Command({
        cmd: ['config'],
        desc: 'Edit bot configuration',
        react: "⚙️",
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            const jid = m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid;
            // Extract the correct bot ID including the server
            const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";

            // Check if the command sender is the owner or the bot itself
            const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
            allowedNumbers.push(botNumber);

            if (!allowedNumbers.includes(jid)) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: "🚫 *Only the owner or the bot can edit config.js the bot.*"
                }, { quoted: m });
                return;
            }

            const configPath = path.join(__dirname, '../Config.js');
            const args = m.message?.conversation.split(' ').slice(1).join(' ') || m.message?.extendedTextMessage?.text.split(' ').slice(1).join(' ');

            // Read the content of Config.js to extract prefixes
            fs.readFile(configPath, 'utf8', (err, data) => {
                if (err) {
                    // Handle error if unable to read Config.js
                    console.error('Error reading Config.js:', err);
                    msg.react('🚫', m);
                    return;
                }

                // Extract prefixes from Config.js
                const prefixesMatch = data.match(/global\..*?=.*?(\[.*?\])/g) || [];
                const prefixes = prefixesMatch.map(match => match.split('.')[0]);

                // Check if the variable name exists in Config.js
                const variableExists = (variableName) => {
                    const variablePattern = new RegExp(`${variableName}\\s*=\\s*\\[([^\\]]*)\\]`);
                    return variablePattern.test(data);
                };

                if (!args) {
                    // Parse the content of Config.js
                    const lines = data.split('\n');
                    const variables = lines.reduce((acc, line) => {
                        const match = line.match(/global\..*? = \[.*?\]/);
                        if (match) {
                            const parts = match[0].split('=');
                            const variableName = prefixes.reduce((name, prefix) => name.replace(prefix, ''), parts[0].trim());
                            const variableValue = parts[1].trim();
                            acc.push(`${variableName} = ${variableValue}`);
                        }
                        return acc;
                    }, []);

                    // Send both the variable names and their values to the user
                    msg.reply(variables.join('\n'), m);
                    return;
                }

                // Check if the user wants to add, replace, remove, or change a boolean value
                const addMatch = args.match(/add\s+(\w+)\s+(.+)/);
                const replaceMatch = args.match(/replace\s+(\w+)\s+(.+)/);
                const removeMatch = args.match(/remove\s+(\w+)/);
                const changeBooleanMatch = args.match(/change\s+(\w+)\s+(true|false)/);

                if (addMatch) {
                    const [, variableName, newValue] = addMatch;
                    if (!variableExists(variableName)) {
                        msg.reply(`Variable ${variableName} does not exist in Config.js`, m);
                        msg.react('🚫', m);
                        return;
                    }
                    
                    // Check if the value already exists in the variable
                    const valueExists = data.match(new RegExp(`\\b${newValue}\\b`));
                    if (valueExists) {
                        msg.reply(`Value "${newValue}" already exists in ${variableName} in Config.js`, m);
                        msg.react('🚫', m);
                        return;
                    }
                    
                    // Add a new value to the specified variable
                    const updatedData = data.replace(new RegExp(`${variableName}\\s*=\\s*\\[([^\\]]*)\\]`), `${variableName} = [$1, '${newValue}']`);
                    // Write the updated content back to Config.js
                    fs.writeFile(configPath, updatedData, 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing to Config.js:', err);
                            msg.react('🚫', m);
                            return;
                        }
                        msg.reply(`Value ${newValue} added to ${variableName} in Config.js`, m);
                    });
                }
                 else if (replaceMatch) {
                    const [, variableName, newValue] = replaceMatch;
                    if (!variableExists(variableName)) {
                        msg.reply(`Variable ${variableName} does not exist in Config.js`, m);
                        msg.react('🚫', m);
                        return;
                    }
                    // Replace the value of the specified variable with a new value
                    const updatedData = data.replace(new RegExp(`${variableName}\\s*=\\s*\\[([^\\]]*)\\]`), `${variableName} = ['${newValue}']`);
                    // Write the updated content back to Config.js
                    fs.writeFile(configPath, updatedData, 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing to Config.js:', err);
                            msg.react('🚫', m);
                            return;
                        }
                        msg.reply(`Value of ${variableName} replaced with ${newValue} in Config.js`, m);
                    });
                } else if (removeMatch) {
                    const [, variableName] = removeMatch;
                    if (!variableExists(variableName)) {
                        msg.reply(`Variable ${variableName} does not exist in Config.js`, m);
                        msg.react('🚫', m);
                        return;
                    }
                
                    // Extract the current value of the variable
                    const variablePattern = new RegExp(`${variableName}\\s*=\\s*\\[([^\\]]*)\\]`);
                    const match = data.match(variablePattern);
                    if (!match || match[1].trim() === '') {
                        msg.reply(`No value found for ${variableName} in Config.js`, m);
                        msg.react('🚫', m);
                        return;
                    }
                
                    // Remove the specified variable's value from Config.js
                    const updatedData = data.replace(variablePattern, `${variableName} = []`);
                    // Write the updated content back to Config.js
                    fs.writeFile(configPath, updatedData, 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing to Config.js:', err);
                            msg.react('🚫', m);
                            return;
                        }
                        msg.reply(`Value of ${variableName} removed from Config.js`, m);
                    });
                }
                 else if (changeBooleanMatch) {
                    const [, variableName, newValue] = changeBooleanMatch;
                    if (!variableExists(variableName)) {
                        msg.reply(`Variable ${variableName} does not exist in Config.js`, m);
                        msg.react('🚫', m);
                        return;
                    }
                    // Change the boolean value of the specified variable
                    const updatedData = data.replace(new RegExp(`${variableName}\\s*=\\s*\\[([^\\]]*)\\]`), `${variableName} = ['${newValue === 'true'}']`);
                    // Write the updated content back to Config.js
                    fs.writeFile(configPath, updatedData, 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing to Config.js:', err);
                            msg.react('🚫', m);
                            return;
                        }
                        msg.reply(`Boolean value of ${variableName} changed to ${newValue} in Config.js`, m);
                    });
                } else {
                    // Invalid command format, suggest how to use each command
                    msg.reply('Invalid command format. Please use one of the following formats:\n' +
                        '.config add variableName value\n' +
                        '.config replace variableName value\n' +
                        '.config remove variableName\n' +
                        '.config change variableName true|false', m);
                    msg.react('🚫', m);
                }


            });
        }
    });
};
