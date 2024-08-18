const express = require('express');
const router = express.Router();
const Message = require('../schema/message'); // Adjust the path to your model
const Users = require('../schema/user'); // Import your Users model (adjust the path if needed)

// GET messages for a specific user
router.get('/chat/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find messages where the user is either the sender or the receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    // If you need to populate user information for the messages
    const messageData = await Promise.all(messages.map(async (message) => {
      const receiverId = message.senderId.toString() === userId ? message.receiverId : message.senderId;
      const user = await Users.findById(receiverId); // Fetch user details
      return {
        ...message.toObject(), // Convert mongoose document to plain object
        receiver: user // Attach user details
      };
    }));

    res.status(200).json(messageData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new message
router.post('/', async (req, res) => {
  try {
    const { content, senderId, senderModel, receiverId, receiverModel } = req.body;

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
