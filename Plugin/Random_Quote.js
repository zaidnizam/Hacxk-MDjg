module.exports = (Command) => {
    Command({
        cmd: ['inspire', 'quote'],
        desc: 'Get an inspirational quote',
        react: "✨", // Sparkling emoji for inspiration
        type: 'INSPIRATIONAL COMMANDS', 
        handler: async (m, sock) => {
            try {
                const response = await fetch('https://api.quotable.io/random'); // Quote API
                const data = await response.json();

                const quoteMessage = `
*✨ Inspirational Quote:*

_"${data.content}"_

- ${data.author}
                `;
                await sock.sendMessage(m.key.remoteJid, { text: quoteMessage }, { quoted: m }); 
            } catch (error) {
                console.error("Error fetching quote:", error);
                await sock.sendMessage(m.key.remoteJid, { text: "Sorry, I couldn't find an inspirational quote right now. 😔" });
            }
        }
    });
};
