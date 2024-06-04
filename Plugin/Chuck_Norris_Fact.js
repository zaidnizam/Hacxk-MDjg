const fetch = require('node-fetch');
module.exports = (Command) => {
    Command({
        cmd: ['chucknorris', 'cnfact'],
        desc: 'Get a random Chuck Norris fact or play a game to guess his age',
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
                msg.reply(chuckNorrisFactMessage, m);
                await msg.rate(m)
            } catch (error) {
                console.error("Error fetching Chuck Norris fact:", error);
                msg.reply("⚠️ Sorry, even Chuck Norris couldn't roundhouse kick this error. 😅 Try again later! 🥋", m); // Humorous error message with emojis
            }
        }
    }),
        Command({
            cmd: ['guessage', 'age', 'of', 'chuck', 'norris'],
            desc: 'Guess the age of Chuck Norris',
            react: "🧐",
            type: 'GAME COMMANDS',
            handler: async (m, sock) => {
                const guessedAge = parseInt(m.message[1]);
                if (isNaN(guessedAge) || guessedAge <= 0) {
                    msg.reply("🤨 That's not a valid age. Please enter a positive integer.", m);
                    return;
                }
                try {
                    const response = await fetch('https://api.chucknorris.io/v1/facts/age', {
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ age: guessedAge }),
                    });
                    const data = await response.json();
                    if (data.success) {
                        msg.reply(`🎉 Congratulations! You guessed Chuck Norris' age correctly! 🎉\n\n${data.message}`, m);
                        await msg.rate(m)
                    } else {
                        msg.reply(`😞 Oh no! Your guess was off. The correct answer is: ${data.correctAnswer}`, m);
                    }
                } catch (error) {
                    console.error("Error fetching Chuck Norris age fact:", error);
                    msg.reply("⚠️ Sorry, even Chuck Norris couldn't provide that information right now. 😅 Try again later! 🥋", m); // Humorous error message with emojis
                }
            }
        });
}