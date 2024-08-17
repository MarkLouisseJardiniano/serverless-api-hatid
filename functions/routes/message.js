const express = require('express');
const router = express.Router();
const Message = require('../schema/message'); // Adjust the path to your model

// Create a new message
router.post('/', async (req, res) => {
    const { text, sender, driver } = req.body;
    try {
      if (!sender || !driver) {
        return res.status(400).json({ message: "Sender and driver required" });
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
    try {
      if (!sender || !driver) {
        return res.status(400).json({ message: "Sender and driver required" });
      }
  
      // Find messages where the sender and driver match
      const messages = await Message.find({
        sender: sender,
        driver: driver
      })
      .sort({ timestamp: 1 })
      .populate('sender driver');
  
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  module.exports = router;
  
