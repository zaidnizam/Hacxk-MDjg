const express = require('express');
const routes = require('./Utils/Main');
const { startHacxkMd } = require('./Utils/Bot');
const http = require('http'); // Require http module for creating the server
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile("./Utils/FrontEnd/page.html", {
    root: __dirname,
  });
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


// Create an HTTP server using Express app
const server = http.createServer(app);
// Attach socket.io to the HTTP server
const io = socketIo(server);


// Start the server
server.listen(PORT, () => {
  startHacxkMd(io, app)
  console.log(`Server is running on port ${PORT}`);
});
