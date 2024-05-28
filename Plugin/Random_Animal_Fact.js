module.exports = (Command) => {
    Command({
        cmd: ['animalfact'],
        desc: 'Get a random fact about an animal',
        react: "🐾",
        type: 'FACT COMMANDS',
        handler: async (m, sock) => {
            try {
                const response = await fetch('https://axoltlapi.herokuapp.com/');
                if (!response.ok) { // Check if the response is successful
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const data = await response.json(); 

                const animalFactMessage = `
*🐾 Amazing Animal Fact:*

${data.facts}
                `;
                await sock.sendMessage(m.key.remoteJid, { text: animalFactMessage }, { quoted: m });
            } catch (error) {
                console.error("Error fetching animal fact:", error);

                // Fallback fact if the API fails
                const fallbackFacts = [
                    "The heart of a shrimp is located in its head.",
                    "A group of owls is called a parliament.",
                    "Cats have 32 muscles in each ear."
                ];
                const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];

                await sock.sendMessage(m.key.remoteJid, { 
                    text: `Sorry, I couldn't fetch a new fact. Here's one from my collection: ${randomFact}` 
                });
            }
        }
    });
};
