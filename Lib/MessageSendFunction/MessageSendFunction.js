const { delay, proto } = require("@whiskeysockets/baileys");

async function messageSend(sock) {
    // Utility function to check if a string is an emoji
    function isEmoji(text) {
        const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
        return emojiRegex.test(text);
    }
    // Define the msg object globally
    global.msg = {
        reply: async (text, m) => {
            if (!sock) {
                throw new Error("No message or socket available");
            }
            await sock.sendPresenceUpdate('composing', m.key.remoteJid);
            await delay(100)
           const message = await sock.sendMessage(m.key.remoteJid, { text: text }, { quoted: m });
           return message
        },
        react: async (react, m) => {
            if (!sock) {
                throw new Error("No message or socket available");
            }
            
            // Check if the react text is a valid emoji
            if (!isEmoji(react)) {
                throw new Error("Invalid emoji reaction");
            }
    
            await sock.sendPresenceUpdate('composing', m.key.remoteJid);
            await delay(100);
            const message = await sock.sendMessage(m.key.remoteJid, { react: { text: react, key: m.key } });
            return message
        },
        edit: async (oldMsg, newMsg, m) => {
            if (!sock) {
                throw new Error("No message or socket available");
            }
    
            await sock.sendPresenceUpdate('composing', m.key.remoteJid);
            await delay(50);
            const message = await sock.sendMessage(m.key.remoteJid, { edit: oldMsg.key,
            text: newMsg,
            type: "MESSAGE_EDIT"});
            return message
        }
    };
}

module.exports = { messageSend };
