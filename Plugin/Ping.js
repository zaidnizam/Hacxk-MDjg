const { performance } = require('perf_hooks');

module.exports = (Command) => {
    Command({
        cmd: ['ping', 'test'], // Define multiple commands as an array
        desc: 'Check ping in ms',
        react: "💨", // Reaction emoji
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            const startTime = performance.now();
            
            // Perform some math calculation (for demonstration purposes)
            const result = 2 + 2; // You can replace this with any calculation
            
            const endTime = performance.now();
            const pingTime = endTime - startTime; // Calculate ping time in milliseconds
            
            // Send the result along with ping time
            await sock.sendMessage(m.key.remoteJid, { 
                text: `Ping: ${pingTime.toFixed(2)} ms` 
            }, { quoted: m });

        }
    });
};
