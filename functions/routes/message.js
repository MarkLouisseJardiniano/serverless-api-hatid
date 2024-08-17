const express = require('express');
const router = express.Router();
const Message = require('../schema/message'); // Adjust the path to your model
router.get('/chat', async (req, res) => {
    const { userId, driverId } = req.query;
    try {
      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: driverId, senderType: 'User', receiverType: 'Driver' },
          { sender: driverId, receiver: userId, senderType: 'Driver', receiverType: 'User' }
        ]
      }).sort({ timestamp: 1 });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  router.post('/', async (req, res) => {
    const { content, sender, senderType, receiver, receiverType } = req.body;
    try {
      if (!content || !sender || !receiver || !senderType || !receiverType) {
        return res.status(400).json({ message: "Content, sender, receiver, senderType, and receiverType are required" });
      }
      const message = new Message({ content, sender, senderType, receiver, receiverType });
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = router;
