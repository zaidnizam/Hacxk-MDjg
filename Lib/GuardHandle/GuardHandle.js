const fs = require('fs');
const path = require('path');

const checkers = [];

// Checker Decorator
function Check({ name, des, type, isEnabled, handler }) {
    const chkArray = Array.isArray(name) ? name : [name];
    checkers.push({ name: chkArray, des, type, isEnabled, handler });
}

// Handle Check Function
async function handleCheck(sock, m) {
    for (const checker of checkers) {
        if (checker.isEnabled) {
            // Call the handler if the check is enabled
            await checker.handler(sock, m);
        }
    }
}

// Update Checks from Folder
async function updateCheckFile(folderPath) {
    // Read the config.js file
    const configPath = path.join(__dirname, '../../Config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Extract all the checker settings from config.js
    const checkersConfig = {};
    const regex = /global\.botSettings\.Check\.(\w+)\s*=\s*(\w+)/g;
    let match;
    while ((match = regex.exec(configContent)) !== null) {
        checkersConfig[match[1]] = match[2] === 'true';
    }

    // Get the list of files in the plugin directory
    const pluginFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    // Iterate over each plugin file and update the isEnabled property if necessary
    pluginFiles.forEach(file => {
        const filePath = path.join(folderPath, file);
        let fileContent = fs.readFileSync(filePath, 'utf8');

        for (const [checkerName, isEnabled] of Object.entries(checkersConfig)) {
            const checkerRegex = new RegExp(`(name:\\s*'${checkerName}'[\\s\\S]*?isEnabled:)\\s*(true|false)`, 'g');
            if (checkerRegex.test(fileContent)) {
                fileContent = fileContent.replace(checkerRegex, `$1 ${isEnabled}`);
                fs.writeFileSync(filePath, fileContent);
                console.log(`Updated ${checkerName} in ${file}`);
            }
        }
    });
}

// Load Checks from Folder
async function loadCheckFromFolder(folderPath) {
    const checkFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    let loadedCount = 0;
    const totalFiles = checkFiles.length;

    for (const file of checkFiles) {
        const filePath = path.join(folderPath, file);
        const checkModule = require(filePath);

        if (typeof checkModule === 'function') {
            checkModule(Check); // Decorate the check module with the Check function
            loadedCount++;

            // Progress Reporting
            const percentage = ((loadedCount / totalFiles) * 100).toFixed(0);
            console.log(`\x1b[32;1m📂 Loaded percentage: ${percentage}% (${loadedCount}/${totalFiles})\x1b[0m`); // Green and bold
        }
    }
}

module.exports = { loadCheckFromFolder, handleCheck, updateCheckFile };


