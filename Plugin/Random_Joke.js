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

                await sock.sendMessage(m.key.remoteJid, { text: jokeMessage }, { quoted: m }); // Add quote if needed
            } catch (error) {
                console.error("Error fetching joke:", error);
                await sock.sendMessage(m.key.remoteJid, { text: "Sorry, I couldn't find a joke right now. 😔" });
            }
        }
    });
};
