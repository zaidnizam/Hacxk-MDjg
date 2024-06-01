const { delay } = require("@whiskeysockets/baileys");

module.exports = (Checker) => {
    // Flag to indicate whether the handler is already processing a call
    let isProcessingCall = false;

    Checker({
        name: 'RejectCall',
        des: '🚫 RejectCall: Reject Call For Me',
        type: 'All',
        isEnabled: true,
        handler: async (sock, m) => {
            try {
                sock.ev.on('call', async (call) => { // Change `on` to `once`
                    try {
                        const { chatId, from, id, date, isVideo, isGroup } = call[0];
                        const callType = isVideo ? 'Video Call' : 'Voice Call';
                        const groupName = isGroup ? 'Group' : 'Personal Chat';
                        const formattedDate = new Date(date).toLocaleString();

                        await sock.rejectCall(id, from);
                        await delay(2000)
                    } catch (error) {
                        console.error('Error processing call:', error);
                    } 
                });
            } catch (error) {
                console.error('Error in RejectCall handler:', error);
                await sock.sendMessage(sock.user.id, {
                    text: '⚠️ An error occurred while processing the Call. Please try again later.'
                });
            }
        }
    });
};
