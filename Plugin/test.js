const { SinhalaSub } = require('@sl-code-lords/movie-api');

module.exports = (Command) => {
    Command({
        cmd: ['movi'],
        desc: 'Search for movies and get details', // Updated description
        react: "🎬", // Reaction emoji
        type: 'SEARCH COMMANDS',
        handler: async (m, sock) => {
            let args = [];

            if (m.message?.extendedTextMessage?.text) {
                args = m.message.extendedTextMessage.text.split(/ +/);
            } else if (m.message?.conversation) {
                args = m.message.conversation.split(/ +/);
            }

            args.shift(); // Remove the command itself from the args array

            const query = args.join(" ");

            if (!query) {
                await sock.sendMessage(m.key.remoteJid, { text: "Please provide a movie name to search." }, { quoted: m });
                return;
            }

            try {
                await sock.sendMessage(m.key.remoteJid, { text: "🔍 Searching for movies..." }, { quoted: m }); // Searching reaction

                const list = await SinhalaSub.get_list.by_search(query);

                if (!list.status || list.results.length === 0) {
                    await sock.sendMessage(m.key.remoteJid, { text: "No movies found." }, { quoted: m });
                    return;
                }

                const top10Movies = list.results.slice(0, 10);
                const movieChoices = top10Movies.map((result, index) => `*${index + 1}*. ${result.title} (${result.type === 'movies' ? '🎥' : '📺'})`).join("\n");

                const sentMessage = await sock.sendMessage(m.key.remoteJid, {
                    text: `Here are the top 10 results:\n\n${movieChoices}\n\nPlease select the movie number you want.`
                }, { quoted: m });

                const selectedMovieIndex = await getUserResponse(m, sock, sentMessage, 1, 10);
                const selectedMovie = top10Movies[selectedMovieIndex - 1];

                await sock.sendMessage(m.key.remoteJid, {
                    text: `You selected: *${selectedMovie.title}\nMovie Link: *${selectedMovie.link}*`
                }, { quoted: m });

                const movieDetails = await SinhalaSub.movie(selectedMovie.link);
                console.log(movieDetails)
                
                if (movieDetails.status) {
                    // Send movie details
                    // You can format and send the details as per your requirement
                    await sock.sendMessage(m.key.remoteJid, { text: JSON.stringify(movieDetails.result, null, 2) }, { quoted: m });
                } else {
                    await sock.sendMessage(m.key.remoteJid, { text: "Error fetching movie details." }, { quoted: m });
                }
            } catch (error) {
                console.error("Error searching for movies:", error);
                await sock.sendMessage(m.key.remoteJid, { text: "An error occurred while searching for movies." }, { quoted: m });
            }
        }
    });
};

// Helper function to get user response
async function getUserResponse(m, sock, sentMessage, min, max) {
    return new Promise((resolve, reject) => {
        const replyHandler = async (msg) => {
            if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMessage.key.id) {
                const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                const selectedOption = parseInt(replyText);
                if (selectedOption >= min && selectedOption <= max) {
                    resolve(selectedOption);
                } else {
                    await sock.sendMessage(m.key.remoteJid, { text: `Invalid option. Please select a number between ${min} and ${max}.` }, { quoted: msg });
                }
            }
        };

        sock.ev.on('messages.upsert', async ({ messages }) => {
            for (let msg of messages) {
                await replyHandler(msg);
            }
        });
    });
}
