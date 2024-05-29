// Config.js

// Define bot settings object
global.botSettings = {};

// Add owner settings
global.botSettings.ownerNumbers = ['94771014973', '94754802771', '94773255188']; // Example: ['1234567', '453657767'] **PUT YOUR NAMER FIRST**
global.botSettings.botNumber = [''] // Don't Need to input bot will update automatically
global.botSettings.ownerName = ['Mr - Zaid']
global.botSettings.botName = ['Hacxk - MD']
global.botSettings.botPrefix = ['.'] // You can use prefix as /, ., # don't use [!] this
global.botSettings.botWorkMode = ['Private'] // If Private don't Work bot command in group if you want to work use Public
global.botSettings.greetings = true // This mean if a contact join or leave a group sending welcome and goodbye message if 'true' it works if 'false' not work
global.botSettings.tempSession = false // You can put Off also this setting is to save session as temp sometime session will auto delete if still error delete session and Temp/Session folder and rescan and put a new session

// ------------------------------------------------------------------------------------------------------------------------------------------\\


// Define api object
global.api = {};

global.api.openAI = ['']
global.api.gemini = ['']