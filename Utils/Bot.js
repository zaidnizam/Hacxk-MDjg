const {
    makeWASocket, useMultiFileAuthState, Browsers, delay,
    makeInMemoryStore, makeCacheableSignalKeyStore, setMaxListeners, DisconnectReason, fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const { Boom } = require("@hapi/boom");
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode')
require('esm')(module);
// Require the utils file to ensure the reply function is globally available
const { messageSend } = require('../Lib/MessageSendFunction/MessageSendFunction');
const { greetings } = require('../Plugin/Group/Greeting');
const { SessionHandle } = require('../Lib/SessionHandle/SessionHandle');
const { autoCleanUp } = require('../Lib/AutoClean/AutoCleaner');
const { handleCommand, loadCommandsFromFolder } = require('../Lib/CommandHandle/CommandHandle');
const { loadCheckFromFolder, handleCheck, updateCheckFile } = require('../Lib/GuardHandle/GuardHandle');
// Initial loading of commands from the Plugin folder
if (fs.existsSync(path.join(__dirname, '../Plugin'))) {
    console.log("\x1b[33m🔎 Loading Plugin Folder!\x1b[0m");
    loadCommandsFromFolder(path.join(__dirname, '../Plugin'));
    console.log("\x1b[32m✅ Plugin Loaded Successfully. Now Checking Guard Folder!.\x1b[0m");
} else {
    console.error('\x1b[31m❌ Error: Plugin folder not found.\x1b[0m');
}

// Initial loading of commands from the Guard folder
if (fs.existsSync(path.join(__dirname, '../Plugin/Guard'))) {
    console.log("\x1b[33m🔎 Loading Guard Folder!\x1b[0m");
    updateCheckFile(path.join(__dirname, '../Plugin/Guard')).then(() => {
        loadCheckFromFolder(path.join(__dirname, '../Plugin/Guard'));
    });
    console.log("\x1b[32m✅ Guard Folder Loaded Successfully. Now Trying To Start The Bot.\x1b[0m");
} else {
    console.error('\x1b[31m❌ Error: Guard folder not found.\x1b[0m');
}


// Function to start the WhatsApp bot
const startHacxkMd = async (io, app) => {
    if (!io) {
        console.error('Socket.IO is not defined.');
        return;
    }

    if (!app) {
        console.error('app is not defined.');
        return;
    }

    // Event listener for when a client connects
    io.on('connection', (socket) => {
        console.log('A client connected');

        // Event listener for when a client disconnects
        socket.on('disconnect', () => {
            console.log('A client disconnected');
        });
    });
    require('../Config');
    // Import chalk dynamically
    const chalk = await import('chalk').then(module => module.default);

    // Set up logging
    const logger = pino({ level: 'silent' });

    const log = (message, emoji = '🔹') => console.log(chalk.blueBright(`${emoji} ${message}`));
    const errorLog = (message, emoji = '❌') => console.error(chalk.redBright(`${emoji} ${message}`));

    const worktype = global.botSettings.botWorkMode[0].toLowerCase();
    log('Starting WhatsApp Bot...', '🚀');
    try {
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../Session'));
        const sock = makeWASocket({
            printQRInTerminal: true,
            mobile: false,
            keepAliveIntervalMs: 10000,
            syncFullHistory: false,
            downloadHistory: false,
            markOnlineOnConnect: true,
            defaultQueryTimeoutMs: undefined,
            logger,
            Browsers: ['Ubuntu', 'Chrome', '113.0.5672.126'],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            linkPreviewImageThumbnailWidth: 1980,
            generateHighQualityLinkPreview: true,
        });

        // Export the sock variable so it can be accessed from other files
        global.sock = sock;
        log('Socket initialized.', '🔌');
        // sock.setMax
        const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
        store.bind(sock.ev);

        // // In your Express server file (Main.js or other)
        // app.get('/getNewPairingCode', (req, res) => {
        //     // Pairing code for Web clients
        //     if (usePairingCode && !sock.authState.creds.registered) {
        //         if (useMobile) {
        //             throw new Error('Cannot use pairing code with mobile api')
        //         }

        //         const phoneNumber =  question('Please enter your mobile phone number:\n')
        //         const code =  sock.requestPairingCode(phoneNumber)
        //         console.log(`Pairing code: ${code}`)
        //     }
        // });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                log('QR code available:', '📷');
                console.log(qr);
                qrcode.toDataURL(qr, (err, url) => {
                    console.log('Qr Code Sending To Client!')
                    io.emit("qr", url);
                });
                const sessionManger = global.botSettings.tempSession;
                if (sessionManger === true) {
                    const result = await SessionHandle("Paste");
                    if (result.ok === 'Ok') {
                        console.log('\x1b[32m%s\x1b[0m', '✅ Operation succeeded, closing the socket.');
                        await sock.end();
                    } else {
                        console.log('\x1b[31m%s\x1b[0m', '❌ Operation failed.');
                    }
                }
            }

            // In your Express server file (Main.js or other)
            app.get('/getNewQR', (req, res) => {
                getNewQr()
                // Your logic to generate and return a new QR code here
                // For demonstration, let's just send a simple response
                res.send('New QR code generated!');
                io.emit("msg", 'New QR code generated! 🆕');
            });


            function getNewQr() {
                console.log('nahhhhh')
                const qrHandler = async (update) => {
                    const { qr } = update;

                    if (qr) {
                        qrcode.toDataURL(qr, (err, url) => {
                            io.emit("qr", url);

                        });
                        sock.ev.off('connection.update', qrHandler);
                        return
                    }
                };
                sock.ev.on('connection.update', qrHandler);
                return
            }

            if (connection === "open") {
                const sessionManger = global.botSettings.tempSession;
                if (sessionManger === true) {
                    await SessionHandle("Get");
                }
                await autoCleanUp()
                log('Connection opened!', '✅');
                io.emit("msg", 'Connected Successfully ✅');
                io.emit("connected", 'Connected Successfully ✅');
                sock.sendReadReceiptAck = true;
                const ownerName = global.botSettings.ownerName[0];
                const number = global.botSettings.ownerNumbers[0];
                const botName = global.botSettings.botName[0];
                const botPrefix = global.botSettings.botPrefix[0];
                await delay(2500);

                const wakeupmsg = await sock.sendMessage(sock.user.id, {
                    text: `
❪👑❫ *Owner Name*: ${ownerName}
❪🔢❫ *Number*    : ${number}
❪🤖❫ *Bot Name*  : ${botName}
❪☎️❫ *Bot Number*: ${sock.user.id.split(':')[0]}
❪🔖❫ *Prefix*    : ${botPrefix}
                   
> All Credits Goes to Mr Zaid. If you can support our GitHub, we can improve our bot even more...
            `
                });
                await messageSend(sock)
                await delay(5000);
                await sock.sendPresenceUpdate('available', sock.user.id);
                const emojis = ['❤️', '💛', '💚', '💜'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(sock.user.id, {
                    react: {
                        text: randomEmoji,
                        key: wakeupmsg.key
                    }
                });

                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            await sock.end();
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }, 23 * 60 * 1000);
                });
            }

            if (connection === "close") {
                try {
                    const reason = lastDisconnect && lastDisconnect.error ? new Boom(lastDisconnect.error).output.statusCode : 500;
                    switch (reason) {
                        case DisconnectReason.connectionClosed:
                            log('Connection closed!', '🔒');
                            await delay(1000);
                            io.emit("msg", 'Connection closed! 🔒');
                            sock.ev.removeAllListeners();
                            startHacxkMd(io, app);
                            return
                            break;
                        case DisconnectReason.connectionLost:
                            log('Connection lost from server!', '📡');
                            io.emit("msg", 'Connection lost from server! 📡');
                            log('Trying to Reconnect!', '🔂');
                            io.emit("msg", 'Trying to Reconnect! 🔂');
                            await delay(2000);
                            sock.ev.removeAllListeners();
                            startHacxkMd(io, app);
                            return
                            break;
                        case DisconnectReason.restartRequired:
                            log('Restart required, restarting...', '🔄');
                            io.emit("msg", 'Restart required, restarting... 🔄');
                            await delay(1000);
                            sock.ev.removeAllListeners();
                            startHacxkMd(io, app);
                            return
                            break;
                        case DisconnectReason.timedOut:
                            log('Connection timed out!', '⌛');
                            io.emit("msg", 'Connection timed out! ⌛');
                            await delay(1000);
                            sock.ev.removeAllListeners();
                            startHacxkMd(io, app);
                            return
                            break;
                        default:
                            errorLog('Connection closed with bot. Trying to run again.', '⚠️');
                            await delay(3000);
                            io.emit("msg", 'Connection closed with bot. Trying to run again. ⚠️');
                            sock.ev.removeAllListeners();
                            startHacxkMd(io, app);
                            log(`Reason: ${reason}`, 'ℹ️');
                            return
                            break;
                    }
                } catch (error) {
                    errorLog('Error occurred during connection close:', '❗');
                    errorLog(error.message, '❗');
                }
            }
        });

        sock.ev.on('connection.update', async ({ receivedPendingNotifications }) => {
            if (receivedPendingNotifications && !(sock.authState.creds && sock.authState.creds.myAppStateKeyId)) {
                await sock.ev.flush();
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // Listen for group participants update
        sock.ev.on('group-participants.update', async (update) => {
            if (global.botSettings.greetings === true) {
                await greetings(sock, update)
            }
        });

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            try {
                const m = messages[0];
                io.emit("logs", m);
                // Export the message variable so it can be accessed from other files
                global.message = m; // Assign m to global.message
                console.log(m);
                //  console.log(JSON.stringify(m));

                if (global.botSettings.Check.Checkers === true) {
                    handleCheck(sock, m)
                }

                if (worktype === 'private') {
                    if (m.key.remoteJid.endsWith('@s.whatsapp.net')) {
                        await handleCommand(m, sock, delay);
                    } else {
                        return;
                    }
                } else {
                    if (m.key.remoteJid.endsWith('@g.us') || m.key.remoteJid.endsWith('@s.whatsapp.net')) {
                        await handleCommand(m, sock, delay);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        });


    } catch (error) {
        errorLog('Error starting WhatsApp bot:', '❌');
        errorLog(error.message, '❌');
    }
};


module.exports = { startHacxkMd };