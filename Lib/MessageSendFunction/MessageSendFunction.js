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
            await delay(500)
            await sock.sendMessage(m.key.remoteJid, { text: text }, { quoted: m });
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
            await delay(500);
            await sock.sendMessage(m.key.remoteJid, { react: { text: react, key: m.key } });
        },
        edit: async (oldMsg, newMsg, m) => {
            if (!sock) {
                throw new Error("No message or socket available");
            }
    
            await sock.sendPresenceUpdate('composing', m.key.remoteJid);
            await delay(250);
            await sock.sendMessage(m.key.remoteJid, { edit: oldMsg.key,
            text: newMsg,
            type: "MESSAGE_EDIT"});
        }
    };
}

module.exports = { messageSend };
