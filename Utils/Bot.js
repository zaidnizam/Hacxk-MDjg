const pino = require('pino');
const qrcode = require('qrcode');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { makeWASocket, useMultiFileAuthState, delay, DisconnectReason, makeCacheableSignalKeyStore, makeInMemoryStore, getDevice } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const { messageSend } = require('../Lib/MessageSendFunction/MessageSendFunction');
const { greetings } = require('../Plugin/Group/Greeting');
const { SessionHandle } = require('../Lib/SessionHandle/SessionHandle');
const { autoCleanUp } = require('../Lib/AutoClean/AutoCleaner');
const { handleCommand, loadCommandsFromFolder } = require('../Lib/CommandHandle/CommandHandle');
const { loadCheckFromFolder, handleCheck, updateCheckFile } = require('../Lib/GuardHandle/GuardHandle');

require('esm')(module);

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

let pairingCodeEnable;
let isLogged;
let isOnline;

const startWABot = async (io, app, logger) => {
    // Define routes for generating QR code and pairing code
    app.get('/qrpair', (req, res) => {
        pairingCodeEnable = false;
        startHacxk(io, app, logger, 'QR');
        console.log('Function Started');
        res.send('New QR code generating!');
    });

    app.get('/pairingcode', (req, res) => {
        pairingCodeEnable = true;
        startHacxk(io, app, logger, 'CODE');
        console.log('Function Started pair');
        res.send('New Pairing code generating!');
    });

    app.get('/opt', (req, res) => {
        res.send(isLogged ? 'true' : 'false');
    });

    app.get('/authopt', (req, res) => {
        res.send(pairingCodeEnable)
    });

}




// Function to start the WhatsApp bot
const startHacxkMd = async (io, app) => {
    try {
        // Check if Socket.IO and Express app are defined
        if (!io || !app) {
            throw new Error('Socket.IO or Express app is not defined.');
        }

        // Set up logging
        const logger = pino({ level: 'silent' });

        // Handle connection events
        io.on('connection', (socket) => {
            console.log('A client connected');
            socket.on('disconnect', () => {
                console.log('A client disconnected');
            });
        });

        // Start WhatsApp bot
        await startWhatsAppBot(io, app, logger);

        app.get('/botstatus', (req, res) => {
            res.send(isOnline)
        });

    } catch (error) {
        console.error('Error starting WhatsApp bot:', error);
    }
};

// Start WhatsApp bot
const startWhatsAppBot = async (io, app, logger) => {
    // Load state and authentication
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../Session'));

    // Configure and start the socket
    const sockConfig = {
        printQRInTerminal: false,
        mobile: false,
        keepAliveIntervalMs: 10000,
        syncFullHistory: false,
        downloadHistory: false,
        markOnlineOnConnect: true,
        defaultQueryTimeoutMs: undefined,
        logger,
        Browsers: ['Hacxk-MD', 'Chrome', '113.0.5672.126'],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        linkPreviewImageThumbnailWidth: 1980,
        generateHighQualityLinkPreview: true,
    };

    try {
        const socket = await makeWASocket(sockConfig);

        if (!socket.user) {
            io.emit("isLogged", false);
            isLogged = false;
            startWABot(io, app, logger);
            await socket.ws.close();
            throw new Error('Not Logged In. Trying To Log In!');
        } else {
            // Start hacxk only if the user is logged in
            startHacxk(io, app, logger, null, socket);

            socket.ev.on('connection.update', async ({ receivedPendingNotifications }) => {
                if (receivedPendingNotifications && !(socket.authState.creds && socket.authState.creds.myAppStateKeyId)) {
                    await socket.ev.flush();
                }
            });

            socket.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === "open") {
                    isOnline = true;
                    isLogged = true;
                    const sessionManger = global.botSettings.tempSession;
                    if (sessionManger === true) {
                        await SessionHandle("Get");
                    }
                    await autoCleanUp()
                    console.log('Connection opened!', '✅');
                    io.emit("msg", 'Connected Successfully ✅');
                    io.emit("connected", 'Connected Successfully ✅');
                    socket.sendReadReceiptAck = true;
                    const ownerName = global.botSettings.ownerName[0];
                    const number = global.botSettings.ownerNumbers[0];
                    const botName = global.botSettings.botName[0];
                    const botPrefix = global.botSettings.botPrefix[0];
                    await delay(2500);

                    const wakeupmsg = await socket.sendMessage(socket.user.id, {
                        text: `
    ❪👑❫ *Owner Name*: ${ownerName}
    ❪🔢❫ *Number*    : ${number}
    ❪🤖❫ *Bot Name*  : ${botName}
    ❪☎️❫ *Bot Number*: ${socket.user.id.split(':')[0]}
    ❪🔖❫ *Prefix*    : ${botPrefix}
                       
    > All Credits Goes to Mr Zaid. If you can support our GitHub, we can improve our bot even more...
                `
                    });
                    const device = await getDevice(wakeupmsg.key.id);
                    console.log(device)
                    io.emit("device", device);
                    await messageSend(socket)
                    await delay(5000);
                    app.get('/restartbota', (req, res) => {
                        socket.end();
                        res.send('Sucessfully Bot Restarted! 🔄')
                        io.emit("msg", 'Sucessfully Bot Restarted! 🔄');
                    });
                    await sock.sendPresenceUpdate('available', socket.user.id);
                    return new Promise((resolve, reject) => {
                        setTimeout(async () => {
                            try {
                                await socket.end();
                                console.log(';;;;;;;OFFFFFF;;;;;;;;;')
                                isOnline = false;
                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        }, 15 * 60 * 1000);
                    });
                }

                const code = lastDisconnect?.error?.output?.statusCode;

                if (connection === "close" || code) {
                    try {
                        const reason = lastDisconnect && lastDisconnect.error ? new Boom(lastDisconnect.error).output.statusCode : 500;
                        switch (reason) {
                            case DisconnectReason.connectionClosed:
                                io.emit("msg", 'Connection closed! 🔒');
                                sock.ev.removeAllListeners();
                                startWhatsAppBot(io, app, logger);
                                await socket.ws.close();
                                return;
                            case DisconnectReason.connectionLost:
                                io.emit("msg", 'Connection lost from server! 📡');
                                io.emit("msg", 'Trying to Reconnect! 🔂');
                                await delay(2000);
                                sock.ev.removeAllListeners();
                                startHacxk(io, app, logger);
                                await socket.ws.close();
                                return;
                            case DisconnectReason.restartRequired:
                                io.emit("msg", 'Restart required, restarting... 🔄');
                                await delay(1000);
                                sock.ev.removeAllListeners();
                                startWhatsAppBot(io, app, logger);
                                return;
                            case DisconnectReason.timedOut:
                                io.emit("msg", 'Connection timed out! ⌛');
                                sock.ev.removeAllListeners();
                                startHacxk(io, app, logger);
                                await socket.ws.close();
                                return;
                            default:
                                io.emit("msg", 'Connection closed with bot. Trying to run again. ⚠️');
                                sock.ev.removeAllListeners();
                                startWhatsAppBot(io, app, logger);
                                await socket.ws.close();
                                return;
                        }
                    } catch (error) {
                        console.error('Error occurred during connection close:', error.message);
                    }
                }
            });


            await allEvent(socket, io)
        }
    } catch (error) {
        console.error(error); // Log the error
        // Handle the error as required
    }
    return;
};

async function startHacxk(io, app, logger, option, sockets) {
    if (sockets) {
        sock = sockets;
    } else if (option === 'QR') {
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../Session'));
        // Configure and start the socket
        const sockConfig = {
            printQRInTerminal: true,
            mobile: false,
            keepAliveIntervalMs: 10000,
            syncFullHistory: false,
            downloadHistory: false,
            markOnlineOnConnect: true,
            defaultQueryTimeoutMs: undefined,
            logger,
            Browsers: ['Hacxk-MD', 'Chrome', '113.0.5672.126'],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            linkPreviewImageThumbnailWidth: 1980,
            generateHighQualityLinkPreview: true,
        };

        // Create the socket
        const sock = await makeWASocket(sockConfig);

        sock.ev.on('connection.update', async ({ receivedPendingNotifications }) => {
            if (receivedPendingNotifications && !(sock.authState.creds && sock.authState.creds.myAppStateKeyId)) {
                await sock.ev.flush();
            }
        });

        sock.ev.on('creds.update', saveCreds);

        const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
        store.bind(sock.ev);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrcode.toDataURL(qr, (err, url) => {
                    console.log('Qr Code Sending To Client!');
                    io.emit("qr", url);
                });
            }

            if (connection === "open") {
                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            await sock.end();
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }, 20 * 60 * 1000);
                });
            }

            const code = lastDisconnect?.error?.output?.statusCode;

            if (connection === "close" && code) {
                try {
                    const reason = lastDisconnect && lastDisconnect.error ? new Boom(lastDisconnect.error).output.statusCode : 500;
                    switch (reason) {
                        case DisconnectReason.connectionClosed:
                            io.emit("msg", 'Connection closed! 🔒');
                            sock.ev.removeAllListeners();
                            startHacxk(io, app, logger, option, sockets);
                            return;
                        case DisconnectReason.connectionLost:
                            io.emit("msg", 'Connection lost from server! 📡');
                            io.emit("msg", 'Trying to Reconnect! 🔂');
                            await delay(2000);
                            sock.ev.removeAllListeners();
                            startHacxk(io, app, logger, option, sockets);
                            return;
                        case DisconnectReason.restartRequired:
                            io.emit("msg", 'Restart required, restarting... 🔄');
                            await delay(1000);
                            sock.ev.removeAllListeners();
                            startWhatsAppBot(io, app, logger);
                            await sock.ws.close();
                            return;
                        case DisconnectReason.timedOut:
                            io.emit("msg", 'Connection timed out! ⌛');
                            sock.ev.removeAllListeners();
                            startHacxk(io, app, logger, option, sockets);
                            return;
                        default:
                            io.emit("msg", 'Connection closed with bot. Trying to run again. ⚠️');
                            sock.ev.removeAllListeners();
                            startHacxk(io, app, logger, option, sockets);
                            return;
                    }
                } catch (error) {
                    console.error('Error occurred during connection close:', error.message);
                }
            }
        });

        sock.ev.on('connection.update', async ({ receivedPendingNotifications }) => {
            if (receivedPendingNotifications && !(sock.authState.creds && sock.authState.creds.myAppStateKeyId)) {
                await sock.ev.flush(true);
            }
        });

        sock.ev.on('creds.update', saveCreds);

        await allEvent(sock, io)

        // await sockEvent(sock)
    } else if (option === 'CODE') {
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../Session'));
        // Configure and start the socket
        const sockConfig = {
            printQRInTerminal: false,
            mobile: false,
            keepAliveIntervalMs: 10000,
            syncFullHistory: false,
            downloadHistory: false,
            markOnlineOnConnect: true,
            defaultQueryTimeoutMs: undefined,
            logger,
            Browsers: ['Hacxk-MD', 'Chrome', '113.0.5672.126'],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            linkPreviewImageThumbnailWidth: 1980,
            generateHighQualityLinkPreview: true,
        };

        // Create the socket
        const sock = await makeWASocket(sockConfig);

        if (sockConfig.mobile) {
            throw new Error('Cannot use pairing code with mobile api');
        }

        app.post('/pairnumber', (req, res) => {
            const pairingNumber = req.body.pairingNumber;
            if (!pairingNumber) {
                return res.status(400).send('Invalid pairing number.');
            }

            setTimeout(async () => {
                try {
                    // Simulate pairing code generation process
                    const pairingCode = await generatePairingCode(pairingNumber); // Implement your pairing code generation logic here
                    console.log(`Pairing code: ${pairingCode}`);
                    res.send(pairingCode);
                } catch (error) {
                    console.error('Error generating pairing code:', error);
                    res.status(500).send('Error generating pairing code.');
                }
            }, 5000);
        });


        // Function to generate pairing code (you need to implement this)
        async function generatePairingCode(pairingNumber) {
            if (!sock.authState.creds.registered) {
                const code = await sock.requestPairingCode(pairingNumber);
                return code;
            }
        }



        sock.ev.on('connection.update', async ({ receivedPendingNotifications }) => {
            if (receivedPendingNotifications && !(sock.authState.creds && sock.authState.creds.myAppStateKeyId)) {
                await sock.ev.flush(true);
            }
        });

        sock.ev.on('creds.update', saveCreds);

        const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
        store.bind(sock.ev);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "open") {
                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            await sock.end();
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }, 20 * 60 * 1000);
                });
            }

            if (connection === "close") {
                try {
                    const reason = lastDisconnect && lastDisconnect.error ? new Boom(lastDisconnect.error).output.statusCode : 500;
                    switch (reason) {
                        case DisconnectReason.connectionClosed:
                            io.emit("msg", 'Connection closed! 🔒');
                            sock.ev.removeAllListeners();
                            startHacxk(io, app, logger, option, sockets);
                            return;
                        case DisconnectReason.connectionLost:
                            io.emit("msg", 'Connection lost from server! 📡');
                            io.emit("msg", 'Trying to Reconnect! 🔂');
                            await delay(2000);
                            sock.ev.removeAllListeners();
                            startHacxk(io, app, logger, option, sockets);
                            return;
                        case DisconnectReason.restartRequired:
                            io.emit("msg", 'Restart required, restarting... 🔄');
                            await delay(1000);
                            startWhatsAppBot(io, app, logger);
                            await sock.ws.close();
                            return;
                        case DisconnectReason.timedOut:
                            io.emit("msg", 'Connection timed out! ⌛');
                            sock.ev.removeAllListeners();
                            startHacxk(io, app, logger, option, sockets);
                            return;
                        default:
                            io.emit("msg", 'Connection closed with bot. Trying to run again. ⚠️');
                            sock.ev.removeAllListeners();
                            startHacxk(io, app, logger, option, sockets);
                            return;
                    }
                } catch (error) {
                    console.error('Error occurred during connection close:', error.message);
                }
            }
        });

        sock.ev.on('connection.update', async ({ receivedPendingNotifications }) => {
            if (receivedPendingNotifications && !(sock.authState.creds && sock.authState.creds.myAppStateKeyId)) {
                await sock.ev.flush(true);
            }
        });

        sock.ev.on('creds.update', saveCreds);

        await allEvent(sock, io)
    }
}

async function allEvent(sock, io) {
    const worktype = global.botSettings.botWorkMode[0]
    // Listen for group participants update
    sock.ev.on('group-participants.update', async (update) => {
        if (global.botSettings.greetings === true) {
            await greetings(sock, update)
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            const m = messages[0];
            io.emit("msgss", JSON.stringify(m));
            io.emit("logs", m);
            // Export the message variable so it can be accessed from other files
            global.message = m; // Assign m to global.message
            console.log(m);
            //  console.log(JSON.stringify(m));
            if (global.Check.Checkers === true) {
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


}

module.exports = { startHacxkMd };
