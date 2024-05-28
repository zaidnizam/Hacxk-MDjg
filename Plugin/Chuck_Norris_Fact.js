module.exports = (Command) => {
    Command({
        cmd: ['chucknorris', 'cnfact'],
        desc: 'Get a random Chuck Norris fact',
        react: "😎",
        type: 'FUN COMMANDS',
        handler: async (m, sock) => {
            try {
                const response = await fetch('https://api.chucknorris.io/jokes/random');
                const data = await response.json();

                const chuckNorrisFactMessage = `
👊 *Chuck Norris Fact!* 💥

${data.value}

💪😎💯
`; // Emojis added for emphasis and fun
                await sock.sendMessage(m.key.remoteJid, { text: chuckNorrisFactMessage }, { quoted: m });
            } catch (error) {
                console.error("Error fetching Chuck Norris fact:", error);
                await sock.sendMessage(m.key.remoteJid, { 
                    text: "⚠️ Sorry, even Chuck Norris couldn't roundhouse kick this error. 😅 Try again later! 🥋" 
                }); // Humorous error message with emojis
            }
        }
    });
};
