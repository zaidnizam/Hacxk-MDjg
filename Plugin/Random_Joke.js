module.exports = (Command) => {
    Command({
        cmd: ['joke'],
        desc: 'Tell a random joke',
        react: "😂",
        type: 'FUN COMMANDS',
        handler: async (m, sock) => {
            try {
                const response = await fetch('https://official-joke-api.appspot.com/random_joke');
                const data = await response.json();

                // Beautify the message
                const jokeMessage = `
*🤣 Here's a joke for you:*

*${data.setup}*

${data.punchline}
                `;

                await msg.react("😂", m); // Add reaction
                await msg.reply(jokeMessage, m); // Send the joke message
            } catch (error) {
                console.error("Error fetching joke:", error);
                await msg.react("😔", m); // Add reaction for error
                await msg.reply("Sorry, I couldn't find a joke right now.", m); // Send error message
            }
        }
    });
};
