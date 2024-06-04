// Define bot settings object
global.botSettings = {};

// Add owner settings
global.botSettings.ownerNumbers = ['94771014973', '94754802771', '94773255188']; // Example: ['1234567', '453657767'] **PUT YOUR NAMER FIRST**
global.botSettings.botNumber = [''] // Don't Need to input bot will update automatically
global.botSettings.ownerName = ['Mr - Zaid']
global.botSettings.botName = ['Hacxk - MD']
global.botSettings.botVersion = ['2.0.1']
global.botSettings.botPrefix = ['.'] // You can use prefix as /, ., # don't use [!] this
global.botSettings.botWorkMode = ['Private'] // If Private don't Work bot command in group if you want to work use Public
global.botSettings.greetings = true // This mean if a contact join or leave a group sending welcome and goodbye message if 'true' it works if 'false' not work
global.botSettings.tempSession = false // You can put true also this setting is to save session as temp sometime session will auto delete if still error delete session and Temp/Session folder and rescan and put a new session
global.botSettings.adultSearch = false // This option is enable/disable Google Safe Search
global.botSettings.directDlLimitinMB = ['220'] // Max Download Size In MB if want you can increase/decrease
global.botSettings.maxAPKDownloadSizeInMB = ['120']
// ------------------------------------------------------------------------------------------------------------------------------------------\\
// Define bot settings object
global.botSettings.Check = {};

// --------- these work if checkers true
global.botSettings.Check.Checkers = true
global.botSettings.Check.AntiLinkChecker = true
global.botSettings.Check.AntiBadWordChecker = false
global.botSettings.Check.RejectCall = true

// Define api object
global.api = {};

global.api.openAI = ['']
global.api.gemini = ['']
