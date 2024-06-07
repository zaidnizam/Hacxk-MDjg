const express = require('express');
const routes = require('./Utils/Main');
const { startHacxkMd } = require('./Utils/Bot');
const { extractGlobalsFromJS, saveChanges } = require('./Utils/Configuration');
const http = require('http'); // Require http module for creating the server
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Create an HTTP server using Express app
const server = http.createServer(app);
// Attach socket.io to the HTTP server
const io = socketIo(server);



// Define the path to the file containing the code
const filePath = path.join(__dirname, 'Config.js');


// Endpoint to fetch global objects
app.get('/getGlobalObjects', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Error reading file');
      return;
    }

    // Extract the global objects from the code
    const globalObjects = extractGlobalsFromJS(data);
    res.json(globalObjects);
  });
});


// Route to handle updating bot settings
app.post('/updateSettings', async (req, res) => {
  const updatedSettings = req.body;
  await saveChanges(updatedSettings);
  res.send({ message: 'Settings updated successfully' }); // Sending a response back to the client
});


app.get("/", (req, res) => {
  res.sendFile("./Utils/FrontEnd/page.html", {
    root: __dirname,
  });
});

app.get("/refreshconfig", (req, res) => {
  // Get the path to the config file
  const configPath = path.resolve(__dirname, './Config');

  // Clear the require cache for the config file
  delete require.cache[require.resolve(configPath)];

  // Load the bot configuration
  require(configPath);

  res.send({ message: 'Success!' })
});


app.use(express.json());
app.use('/api', routes);

app.get("/scan", (req, res) => {
  res.sendFile("./Utils/FrontEnd/qr.html", {
    root: __dirname,
  });
});


app.get("/paircode", (req, res) => {
  res.sendFile("./Utils/FrontEnd/pair.html", {
    root: __dirname,
  });
});

app.get("/botsettings", (req, res) => {
  res.sendFile("./Utils/FrontEnd/botsetting.html", {
    root: __dirname,
  });
});

app.get('/delsession', (req, res) => {
  const directoryPath = './'; // Update this with the path to your directory

  // Check if the directory exists
  fs.access(directoryPath, fs.constants.F_OK, (err) => {
    if (err) {
      res.send('Error: Directory does not exist.');
      return;
    }

    // Check if the folder "Session" exists
    const sessionFolderPath = path.join(directoryPath, 'Session');
    fs.stat(sessionFolderPath, (err, stats) => {
      if (err) {
        res.send('Error: Unable to access Session folder.');
        return;
      }

      if (!stats.isDirectory()) {
        res.send('Error: Session folder does not exist.');
        return;
      }

      // Delete the Session folder
      fs.rmdir(sessionFolderPath, { recursive: true }, (err) => {
        if (err) {
          res.send('Error: Unable to delete Session folder.');
          return;
        }
        res.send('Success: Session folder deleted successfully.');
      });
    });
  });
});


// Start the server
server.listen(PORT, () => {
  startHacxkMd(io, app)
  console.log(`Server is running on port ${PORT}`);
});
