const { performance } = require('perf_hooks');
const os = require('os'); 

module.exports = (Command) => {
    Command({
        cmd: ['alive', 'stats'],
        desc: 'Check if the bot is running and get system stats',
        react: "🤖", 
        type: 'BOT COMMANDS',
        handler: async (m, sock) => {
            const startTime = performance.now();
          //  await send.reply('Helloaaaaaadsaa', m);
            const currentTime = new Date().toLocaleString();
            const uptime = formatUptime(process.uptime());
            
            const { totalmem, freemem } = process.memoryUsage();
            const memoryUsage = (totalmem - freemem) / 1024 / 1024; // MB

            // Simulate processing time (replace with actual tasks)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500));

            const endTime = performance.now(); // Calculate endTime after the delay
            const pingTime = endTime - startTime; // Now calculate pingTime

            const responseMessage = `
            ╔═════ ≪ °❈° ≫ ═════╗
             *${global.botSettings.botName[0]} is Online!* ✨
            ╚═════ ≪ °❈° ≫ ═════╝
            
            📊 *System Stats:*
            ├  Response Time: ${pingTime.toFixed(2)} ms
            ├  Current Time: ${currentTime}
            ├  Uptime: ${uptime}
            ├  Platform: ${os.platform()}
            ├  Memory: ${memoryUsage.toFixed(2)} MB
            └  CPU: ${os.arch()}
            `;

            await sock.sendMessage(m.key.remoteJid, {
                text: responseMessage,
            }, { quoted: m });
        }
    });
};

// Helper function to format uptime (seconds to readable string)
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    seconds %= 3600 * 24;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let uptimeString = '';
    if (days > 0) uptimeString += `${days} days, `;
    if (hours > 0) uptimeString += `${hours} hours, `;
    if (minutes > 0) uptimeString += `${minutes} minutes, `;
    uptimeString += `${seconds.toFixed(0)} seconds`;

    return uptimeString;
}
