const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(global.api.gemini[0]);

module.exports = (Command, msg) => {
    Command({
        cmd: ['aigemini', 'gemini'],
        desc: 'Chat With Most Advanced AI Created By Google AI',
        react: "👨‍💻",
        type: 'AI COMMANDS',
        handler: async (m, sock) => {
            try {
                const args = m.message?.conversation.split(' ').slice(1).join(' ') || m.message?.extendedTextMessage?.text.split(' ').slice(1).join(' ');

                if (!args) {
                    msg.reply('Hey, how can I help you!', m);
                    return;
                }

                msg.react('🤝🏻', m);

                // The Gemini 1.5 models are versatile and work with most use cases
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const result = await model.generateContent(args);
                const response = await result.response;
                const text = await response.text();

                msg.reply(text, m);
                msg.react('✅', m);
            } catch (error) {
                if (error.message.includes('Candidate was blocked due to SAFETY')) {
                    msg.reply("Please always respect the rules and guidelines when using this service. Let's keep the conversation positive and constructive! 🌟", m);
                } else {
                    console.error("Error handling command:", error);
                    msg.reply("An error occurred while processing your request. Please try again later.", m);
                }
            }
        }
    }, msg);
};
