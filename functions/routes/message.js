const express = require('express');
const router = express.Router();
const Message = require('../schema/message'); // Adjust the path to your model

// Create a new message
router.post('/', async (req, res) => {
    const { content, sender, senderType, receiver, receiverType } = req.body;
  
    try {
      // Validate inputs
      if (!content || !sender || !receiver || !senderType || !receiverType) {
        return res.status(400).json({ message: "Content, sender, receiver, senderType, and receiverType are required" });
      }
  
      // Create and save new message
      const message = new Message({ content, sender, senderType, receiver, receiverType });
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// Get messages between a user and a driver
router.get('/', async (req, res) => {
    const { userId, driverId } = req.query;
    const filter = {};
  
    if (userId && driverId) {
      filter.$or = [
        { sender: userId, receiver: driverId, senderType: 'User', receiverType: 'Driver' },
        { sender: driverId, receiver: userId, senderType: 'Driver', receiverType: 'User' }
      ];
    }
  
    try {
      const messages = await Message.find(filter)
        .sort({ timestamp: 1 });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = router;
