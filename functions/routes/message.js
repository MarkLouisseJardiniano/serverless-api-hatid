const express = require('express');
const router = express.Router();
const Message = require('../schema/message'); // Adjust the path to your model

// Create a new message
router.post('/send', async (req, res) => {
  const { text, sender } = req.body;
  try {
    const message = new Message({ text, sender });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
