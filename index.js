const express = require('express');
const routes = require('./Utils/Main');
const { startHacxkMd } = require('./Utils/Bot');
// require('./Config');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);

app.listen(PORT, () => {
  startHacxkMd()
  console.log(`Server is running on port ${PORT}`);
});
