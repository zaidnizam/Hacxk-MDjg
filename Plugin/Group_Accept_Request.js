module.exports = (Command) => {
    Command({
        cmd: ['getpendingrequest'],
        desc: 'Get All Pending Group Join Request',
        react: "💂‍♂️",
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {

            const { remoteJid, participant, quoted } = m.key;

            // Initial checks
            if (!remoteJid.endsWith('@g.us')) {
                await sendWithReaction(sock, remoteJid, "❌", "*This command can only be used in groups.*", m);
                return;
            }

            // Extract the correct bot ID including the server
            const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";

            // Check if the command sender is the owner or the bot itself
            const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
            allowedNumbers.push(botNumber);
            if (!allowedNumbers.includes(participant)) {
                await sendWithReaction(sock, remoteJid, "🚫", "*Only the owner or bot can accept new members to the group.*", m);
                return;
            }

            // Check if the bot is an admin in the group
            const groupMetadata = await sock.groupMetadata(remoteJid);
            const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);

            if (!botIsAdmin) {
                await sendWithReaction(sock, m.key.remoteJid, "🤖", "*I cannot accept members because I am not an admin in this group.*", m);
                return;
            }

            const pendingRequest = await sock.groupRequestParticipantsList(m.key.remoteJid);
            if (!pendingRequest || pendingRequest.length === 0) {
                msg.reply('No Pending Request Found For This Group!', m);
                return;
            } else {
                const formattedRequests = pendingRequest.map((request, index) => {
                    const jid = request.jid.split('@')[0];
                    const requestTime = new Date(request.request_time * 1000); // Convert UNIX timestamp to milliseconds
                    const requestHour = requestTime.getHours();
                    const requestMethod = request.request_method;

                    return `🔢 ${index + 1}\n📱 Request Number: ${jid}\n🕒 Request Time: ${requestHour} hours\n🔗 Request Via: ${requestMethod}\n`;
                });

                const response = formattedRequests.join('\n');
                msg.reply(`📋 **Pending Join Requests:**\n\n${response}\n\n **TO APPROVE ALL SEND .approve All or once send .approve [User Number] to Reject Send .reject All or .reject [User Number]**`, m);
            }

        }
    }),
    Command({
        cmd: ['approve'],
        desc: 'Approve Pending Group Join Request',
        react: "🧑‍🎓",
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            const args = m.message?.conversation.split(' ').slice(1).join(' ') || m.message?.extendedTextMessage?.text.split(' ').slice(1).join(' ');
    
            // Extract the correct bot ID including the server
            const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";
    
            // Check if the command sender is the owner or the bot itself
            const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
            allowedNumbers.push(botNumber);
            if (!allowedNumbers.includes(m.key.participant)) {
                await msg.reply("❌ *Only the owner or the bot can approve new members.*", m);
                return;
            }
    
            if (!m.key.remoteJid.endsWith('@g.us')) {
                msg.reply('❌ *This command can only be used in groups.*', m);
                return;
            }
    
            // Check if the bot is an admin in the group
            const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
            const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);
    
            if (!botIsAdmin) {
                msg.reply("❌ *I cannot approve new members because I am not an admin in this group.*", m);
                return;
            }
    
            const pendingRequest = await sock.groupRequestParticipantsList(m.key.remoteJid);
            if (!pendingRequest || pendingRequest.length === 0) {
                msg.reply('❌ *No pending requests found for this group.*', m);
                return;
            }
    
            if (!args) {
                msg.reply('❌ *Please provide a number to approve in this group.*', m);
                return;
            }
    
            if (args.toLowerCase() === 'all') {
                const results = [];
                for (const request of pendingRequest) {
                    const actionResult = await sock.groupRequestParticipantsUpdate(m.key.remoteJid, [request.jid], 'approve');
                    results.push(`✅ Approved request for @${request.jid.split('@')[0]}.`);
                }
                const response = results.join('\n');
                msg.reply(response, m);
                return;
            }
    
            const requestNumber = parseInt(args, 10);
            if (isNaN(requestNumber) || requestNumber < 1 || requestNumber > pendingRequest.length) {
                msg.reply('❌ *Invalid request number. Please provide a valid number.*', m);
                return;
            }
    
            const request = pendingRequest[requestNumber - 1];
            await sock.groupRequestParticipantsUpdate(m.key.remoteJid, [request.jid], 'approve');
            msg.reply(`✅ *Approved request for @${request.jid.split('@')[0]}.*`, m);
        }
    }),
    Command({
        cmd: ['reject'],
        desc: 'Reject Pending Group Join Request',
        react: "🚫",
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            const args = m.message?.conversation.split(' ').slice(1).join(' ') || m.message?.extendedTextMessage?.text.split(' ').slice(1).join(' ');
    
            // Extract the correct bot ID including the server
            const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";
    
            // Check if the command sender is the owner or the bot itself
            const allowedNumbers = global.botSettings.ownerNumbers.map(num => num + '@s.whatsapp.net');
            allowedNumbers.push(botNumber);
            if (!allowedNumbers.includes(m.key.participant)) {
                await msg.reply("❌ *Only the owner or the bot can reject new members.*", m);
                return;
            }
    
            if (!m.key.remoteJid.endsWith('@g.us')) {
                msg.reply('❌ *This command can only be used in groups.*', m);
                return;
            }
    
            // Check if the bot is an admin in the group
            const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
            const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);
    
            if (!botIsAdmin) {
                msg.reply("❌ *I cannot reject new members because I am not an admin in this group.*", m);
                return;
            }
    
            const pendingRequest = await sock.groupRequestParticipantsList(m.key.remoteJid);
            if (!pendingRequest || pendingRequest.length === 0) {
                msg.reply('❌ *No pending requests found for this group.*', m);
                return;
            }
    
            if (!args) {
                msg.reply('❌ *Please provide a number to reject in this group.*', m);
                return;
            }
    
            if (args.toLowerCase() === 'all') {
                const results = [];
                for (const request of pendingRequest) {
                    const actionResult = await sock.groupRequestParticipantsUpdate(m.key.remoteJid, [request.jid], 'reject');
                    results.push(`🚫 Rejected request for @${request.jid.split('@')[0]}.`);
                }
                const response = results.join('\n');
                msg.reply(response, m);
                return;
            }
    
            const requestNumber = parseInt(args, 10);
            if (isNaN(requestNumber) || requestNumber < 1 || requestNumber > pendingRequest.length) {
                msg.reply('❌ *Invalid request number. Please provide a valid number.*', m);
                return;
            }
    
            const request = pendingRequest[requestNumber - 1];
            await sock.groupRequestParticipantsUpdate(m.key.remoteJid, [request.jid], 'reject');
            msg.reply(`🚫 *Rejected request for @${request.jid.split('@')[0]}.*`, m);
        }
    });
    
    
};


// Helper function to send a message with a reaction and WhatsApp font hacks
async function sendWithReaction(sock, remoteJid, reaction, text, m) {
    // Apply WhatsApp font hacks (bold, italic, etc.) to the text message
    const formattedText = text
        .replace(/\*(.+?)\*/g, "*$1*")   // Bold
        .replace(/_(.+?)_/g, "_$1_")    // Italics
        .replace(/~(.+?)~/g, "~$1~");   // Strikethrough

    await msg.react(reaction, m);
    await msg.reply(formattedText, m);
}
