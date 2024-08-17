const express = require('express');
const router = express.Router();
const Message = require('../schema/message'); // Adjust the path to your model

// Create a new message
// Get all messages
app.get('/messages', async (req, res) => {
    try {
      const messages = await Message.find();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  
  // Post a new message (optional if you use socket.io for real-time messaging)
  app.post('/messages', async (req, res) => {
    try {
      const message = new Message(req.body);
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save message' });
    }
  });
  

module.exports = router;
