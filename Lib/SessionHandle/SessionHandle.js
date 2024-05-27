const fs = require('fs').promises;
const path = require('path');

async function SessionHandle(option) {
    const rootPath = path.resolve(__dirname, '..', '..'); // Two levels up from Lib/SessionHandle
    const sessionPath = path.join(rootPath, 'Session');
    const tempSessionPath = path.join(rootPath, 'Temp', 'Session');

    try {
        if (option === 'Get') {
            // Check if Temp/Session exists, if so, delete it
            if (await fs.stat(tempSessionPath).then(() => true).catch(() => false)) {
                await fs.rm(tempSessionPath, { recursive: true, force: true });
            }

            // Create Temp/Session directory
            await fs.mkdir(tempSessionPath, { recursive: true });

            // Read files from the Session directory
            const files = await fs.readdir(sessionPath).catch(err => {
                if (err.code === 'ENOENT') {
                    console.log('\x1b[31m%s\x1b[0m', '❌ Session folder does not exist.');
                    return [];
                }
                throw err;
            });

            // Copy each file to Temp/Session
            for (const file of files) {
                const sourceFile = path.join(sessionPath, file);
                const destFile = path.join(tempSessionPath, file);
                await fs.copyFile(sourceFile, destFile).catch(err => {
                    if (err.code === 'ENOENT') {
                        console.log('\x1b[31m%s\x1b[0m', `❌ File not found: ${sourceFile}`);
                    } else {
                        throw err;
                    }
                });
            }

            console.log('\x1b[32m%s\x1b[0m', '✅ Session files have been saved to Temp/Session');
            return { ok: 'Ok' }; // Return a success response
        } else {
            // Check if Temp/Session exists
            if (await fs.stat(tempSessionPath).then(() => true).catch(() => false)) {
                const tempFiles = await fs.readdir(tempSessionPath);

                if (tempFiles.length > 0) {
                    // If Session exists, delete it
                    if (await fs.stat(sessionPath).then(() => true).catch(() => false)) {
                        await fs.rm(sessionPath, { recursive: true, force: true });
                    }

                    // Create new Session directory
                    await fs.mkdir(sessionPath, { recursive: true });

                    // Copy each file from Temp/Session to Session
                    for (const file of tempFiles) {
                        const sourceFile = path.join(tempSessionPath, file);
                        const destFile = path.join(sessionPath, file);
                        await fs.copyFile(sourceFile, destFile).catch(err => {
                            if (err.code === 'ENOENT') {
                                console.log('\x1b[31m%s\x1b[0m', `❌ File not found: ${sourceFile}`);
                            } else {
                                throw err;
                            }
                        });
                    }

                    console.log('\x1b[32m%s\x1b[0m', '✅ Temp/Session files have been copied back to Session');
                    return { ok: 'Ok' }; // Return a success response
                } else {
                    console.log('\x1b[33m%s\x1b[0m', '⚠️ Temp/Session folder is empty. No files to copy.');
                }
            } else {
                console.log('\x1b[33m%s\x1b[0m', '⚠️ Temp/Session folder does not exist. No files to copy.');
            }
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Error handling session files:', err);
    }

    return { ok: 'Failed' }; // Return a failure response if something goes wrong
}

module.exports = { SessionHandle };
