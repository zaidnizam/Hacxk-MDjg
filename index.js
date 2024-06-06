const express = require('express');
const routes = require('./Utils/Main');
const { startHacxkMd } = require('./Utils/Bot');
const http = require('http'); // Require http module for creating the server
const socketIo = require('socket.io');

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
  res.sendFile("./Utils/FrontEnd/index.html", {
    root: __dirname,
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
