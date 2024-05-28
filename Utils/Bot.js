const {
    makeWASocket, useMultiFileAuthState, Browsers, delay,
    makeInMemoryStore, makeCacheableSignalKeyStore, DisconnectReason
  } = require("@whiskeysockets/baileys");
  const pino = require('pino');
  const { Boom } = require("@hapi/boom");
  const path = require('path');
  const fs = require('fs');
  require('esm')(module);
  require('../Config');
  const { SessionHandle } = require('../Lib/SessionHandle/SessionHandle');
  const { handleCommand, loadCommandsFromFolder } = require('../Lib/CommandHandle/CommandHandle');
  
  // Check if the folder exists
  if (fs.existsSync(path.join(__dirname, '../Plugin'))) {
    // Load commands from the Plugin folder
    console.log("\x1b[33m🔎 Loading Plugin Folder!\x1b[0m");
    loadCommandsFromFolder(path.join(__dirname, '../Plugin'));
    console.log("\x1b[32m✅ Plugin Loaded Successfully. Now Trying To Start The Bot.\x1b[0m");
  } else {
    console.error('\x1b[31m❌ Error: Plugin folder not found.\x1b[0m');
  }
  
  // Function to start the WhatsApp bot
  const startHacxkMd = async () => {
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
        logger,
        version: [2, 2413, 1],
        browser: Browsers.macOS("Desktop"),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        linkPreviewImageThumbnailWidth: 1980,
        generateHighQualityLinkPreview: true,
      });
  
      log('Socket initialized.', '🔌');
  
      const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
      store.bind(sock.ev);
  
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
  
        if (qr) {
          log('QR code available:', '📷');
          console.log(qr);
          const result = await SessionHandle("Paste");
          if (result.ok === 'Ok') {
            console.log('\x1b[32m%s\x1b[0m', '✅ Operation succeeded, closing the socket.');
            await sock.end();
          } else {
            console.log('\x1b[31m%s\x1b[0m', '❌ Operation failed.');
          }
        }
  
        if (connection === "open") {
          await SessionHandle("Get");
          log('Connection opened!', '✅');
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
  
          await delay(5000);
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
                startHacxkMd();
                break;
              case DisconnectReason.connectionLost:
                log('Connection lost from server!', '📡');
                log('Trying to Reconnect!', '🔂');
                await delay(2000);
                startHacxkMd();
                break;
              case DisconnectReason.restartRequired:
                log('Restart required, restarting...', '🔄');
                await delay(1000);
                startHacxkMd();
                break;
              case DisconnectReason.timedOut:
                log('Connection timed out!', '⌛');
                await delay(1000);
                startHacxkMd();
                break;
              default:
                errorLog('Connection closed with bot. Trying to run again.', '⚠️');
                await delay(3000);
                startHacxkMd();
                log(`Reason: ${reason}`, 'ℹ️');
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
  
      sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
          const m = messages[0];
          console.log(m);
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
  
