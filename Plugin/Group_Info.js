module.exports = (Command) => {
    Command({
        cmd: ['groupinfo', 'ginfo'],
        desc: 'Get detailed information about this group',
        react: "✨",
        type: 'GROUP COMMANDS',
        handler: async (m, sock) => {
            if (!m.key.remoteJid.endsWith("@g.us")) {
                return sock.sendMessage(m.key.remoteJid, { text: 'This command can only be used in groups!' }, { quoted: m });
            }

            const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
            const participants = groupMetadata.participants;

            const admins = participants.filter(p => p.admin);
            const adminNames = admins.map(admin => admin.id.split('@')[0]).join(', ');

            const creationDate = new Date(groupMetadata.creation * 1000);
            const ageInDays = Math.round((Date.now() - creationDate) / (1000 * 60 * 60 * 24));
            const ageString = ageInDays < 1 ? '👶 Brand new!' : `${ageInDays} days young`;

            const responseMessage = `
╔═════════════════════╗
║ ✨  Group Information  ✨   ║
╠═════════════════════╣
║  
║ 📢  *Group Name:*  ${groupMetadata.subject}
║ 📝  *Description:* 
║      ${groupMetadata.desc || "No description yet."}
║ 
║ 👥  *Members:* ${participants.length}
║      👑 *Admins:* ${adminNames || "None"}
║ 
║ 🗓️  *Created:* ${creationDate.toLocaleDateString()}
║ ⏳  *Group Age:* ${ageString}
║
╚═════════════════════╝

✨  May this group thrive with joy, laughter, and connection! ✨
`;
            await sock.sendMessage(m.key.remoteJid, { text: responseMessage }, { quoted: m });
        }
    });
};
