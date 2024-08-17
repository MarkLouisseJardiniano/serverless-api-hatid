const express = require('express');
const router = express.Router();
const Message = require('../schema/message'); // Adjust the path to your model

// Create a new message
router.post('/', async (req, res) => {
    const { text, sender, receiver, senderModel, receiverModel } = req.body;
    try {
      // Check if sender and receiver are provided along with their models
      if (!sender || !receiver || !senderModel || !receiverModel) {
        return res.status(400).json({ message: "Sender, receiver, and their models are required" });
      }
  
      const message = new Message({ text, sender, receiver, senderModel, receiverModel });
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

  router.get('/', async (req, res) => {
    const { userId, driverId } = req.query;
    const filter = {};
  
    if (userId && driverId) {
      filter.$or = [
        { sender: userId, receiver: driverId, senderModel: 'User', receiverModel: 'Driver' },
        { sender: driverId, receiver: userId, senderModel: 'Driver', receiverModel: 'User' }
      ];
    }
  
    try {
      const messages = await Message.find(filter)
        .sort({ timestamp: 1 })
        .populate('sender receiver');
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
module.exports = router;
