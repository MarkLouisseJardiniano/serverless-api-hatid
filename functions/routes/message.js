
const express = require('express');
const router = express.Router();
const Message = require('../schema/message'); // Adjust the path to your model


router.get('/chat', async (req, res) => {
  const { userId, driverId } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: driverId, senderModel: 'User', receiverModel: 'Driver' },
        { senderId: driverId, receiverId: userId, senderModel: 'Driver', receiverModel: 'User' }
      ]
    }).sort({ dateTime: 1 }); // Sort by dateTime ascending
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', async (req, res) => {
  const { content, senderId, senderModel, receiverId, receiverModel } = req.body;
  try {
    if (!content || !senderId || !receiverId || !senderModel || !receiverModel) {
      return res.status(400).json({ message: "Content, senderId, senderModel, receiverId, and receiverModel are required" });
    }
    const message = new Message({ content, senderId, senderModel, receiverId, receiverModel });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
