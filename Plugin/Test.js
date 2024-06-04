const fs = require('fs');
const { delay, proto } = require('@whiskeysockets/baileys');

module.exports = (Command) => {
    Command({
        cmd: ['rate'],
        desc: 'Send a beautiful image ad reply with a local file',
        react: '💨',
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
        
            msg.react('🥰', m)
            msg.rate(m)
        },
    });
};