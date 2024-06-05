module.exports = (Command) => {
    // ... other commands ...

    // Help Command (Enhanced)
    Command({
        cmd: 'help',
        desc: 'Get help on a specific command',
        react: "❓",
        type: 'BOT COMMANDS',
        handler: async (m, sock, commands) => {
            const prefix = global.botSettings.botPrefix[0];

            // Extract arguments from the message
            let args = [];
            if (m.message?.extendedTextMessage?.text) {
                args = m.message.extendedTextMessage.text.split(/ +/);
            } else if (m.message?.conversation) {
                args = m.message.conversation.split(/ +/);
            }
            args = args.slice(1); // Remove the command itself

            if (args.length === 0) {
                // No argument: Display categorized help menu

                // Categorize commands by type
                const commandCategories = {};
                for (const cmd of commands) {
                    if (!commandCategories[cmd.type]) {
                        commandCategories[cmd.type] = [];
                    }
                    commandCategories[cmd.type].push(cmd);
                }

                // Build the help text
                let helpText = "*Available Commands:*\n\n";
                for (const type in commandCategories) {
                    helpText += `*${type}:*\n`;
                    for (const cmd of commandCategories[type]) {
                        helpText += `  - \`${prefix}${cmd.cmd}\` - ${cmd.desc}\n`;
                    }
                    helpText += "\n"; // Add spacing between categories
                }
                helpText += `\nType \`${prefix}help <command_name>\` for more info on a specific command.`;

                await msg.reply(helpText, m);

            } else {
                // Argument provided: Show help for that specific command
                const commandName = args[0].toLowerCase();
                const command = commands[commandName];
                if (command) {
                    const helpText = `
Command: \`${prefix}${commandName}\`
Description: ${command.desc}
${command.args ? `Arguments: ${command.args}\n` : ''} 
                    `;
                    await msg.reply(helpText, m);
                } else {
                    await msg.reply("Command not found.", m);
                }
            }
        }
    });

    // ... other commands ...
};
