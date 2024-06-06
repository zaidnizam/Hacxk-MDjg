const express = require('express');
const { startHacxkMd } = require('./Bot');

const router = express.Router();

router.get('/start', async (req, res) => {
  try {
    await startHacxkMd();
    res.status(200).send('WhatsApp bot started');
  } catch (error) {
    res.status(500).send(`Error starting bot: ${error.message}`);
  }
});

module.exports = router;