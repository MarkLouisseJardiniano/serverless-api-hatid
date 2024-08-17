const express = require('express');
const router = express.Router();
const Message = require('../schema/message'); // Adjust the path to your model

// Create a new message
router.post('/', async (req, res) => {
  const { text, sender, driver } = req.body;
  try {
    // Check if sender and recipient or driver are provided
    if (!sender || !driver) {
      return res.status(400).json({ message: "Sender and recipient or driver required" });
    }

    const message = new Message({ text, sender, driver });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch messages based on filters
router.get('/', async (req, res) => {
  const { sender, driver } = req.query;
  const filter = {};

  if (sender) filter.sender = sender;
  if (driver) filter.driver = driver;

  try {
    const messages = await Message.find(filter).sort({ timestamp: 1 }).populate('sender recipient driver');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
