const { delay, proto } = require("@whiskeysockets/baileys");
const fs = require('fs');

async function messageSend(sock) {
    try {
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
                await sock.readMessages([m.key]);
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
 
                await sock.readMessages([m.key]);
                await sock.sendPresenceUpdate('composing', m.key.remoteJid);
                await delay(100);
                const message = await sock.sendMessage(m.key.remoteJid, { react: { text: `${react}`, key: m.key } });
                return message
            },
            edit: async (oldMsg, newMsg, m) => {
                if (!sock) {
                    throw new Error("No message or socket available");
                }
                await sock.readMessages([m.key]);
                await sock.sendPresenceUpdate('composing', m.key.remoteJid);
                await delay(50);
                const message = await sock.sendMessage(m.key.remoteJid, {
                    edit: oldMsg.key,
                    text: newMsg,
                    type: "MESSAGE_EDIT"
                });
                return message
            },
            rate: async (m) => {
                if (!sock) {
                    throw new Error("No message or socket available");
                }
                // Read the local file
                const imageBuffer = fs.readFileSync('./Assets/_RateUsAssets/RateUsThumbnail.png');
                await sock.readMessages([m.key]);
                await sock.sendPresenceUpdate('composing', m.key.remoteJid);
                await delay(50);
                const message = await sock.sendMessage(
                    m.key.remoteJid,
                    {
                        image: imageBuffer,
                        caption: `💻 *Hacxk-MD! - Multi Device Whatsapp Bot* 💻

        👋 I am *Zaid*. This is my successful bot **working since 2023**. I deployed it for **free use** 🆓. So you can get *rich* features. I'm asking one favor: Click the *AD* above and ⭐ star my GitHub repository. It would be a big motivation for me! Thanks for reading and using my bot. 🙏
                    
    *Special Thanks To*
                    
> 🙏 My God!
> 👪 My Parents
> 🤝 Some of my Discord and WhatsApp friends
> 👥 Using my bot all of you! guys
                    
    🚀 Hacxk-MD is your all-in-one solution for a powerful, multi-device bot! Access rich features with WhatsApp: anywhere, anytime, so your data is never lost again.
                    
    *TODO LIST:*
                    
 - \`APK DOWNLOADER\`
 - \`GPT, GEMINI, OTHER AI IMPLEMENTATION\`
 - \`SOME MAIN BUG FIXES+\`
                    
    🔍 Learn more: Check out Hacxk-MD on GitHub!
                    
    📧 For inquiries, contact the owner: Mr-Zaid
                    `,
                        contextInfo: {
                            externalAdReply: {
                                showAdAttribution: false,
                                renderLargerThumbnail: true,
                                title: 'Hacxk Multi-Device Note-Taking', // Descriptive title
                                body: 'Hacxk-MD: Your multi-device note-taking companion', // More descriptive body
                                mediaType: proto.ContextInfo.ExternalAdReplyInfo.MediaType.IMAGE,
                                thumbnailUrl: 'https://github.com/hacxk/Hacxk-MD', // Replace with your thumbnail URL
                                width: 3840,
                                height: 2160,
                                mediaUrl: 'https://github.com/hacxk/Hacxk-MD', // Replace with your repository URL
                                sourceUrl: 'https://github.com/hacxk/Hacxk-MD', // Replace with your GitHub source URL
                            },
                        },
                    },
                    { quoted: m }
                );
                return message
            }
        };
    } catch (error) {
        console.error("An error occurred:", error);
        // You can also log the error to a file or handle it in a specific way
    }
}

module.exports = { messageSend };