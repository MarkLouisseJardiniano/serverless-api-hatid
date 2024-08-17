const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Sender can be a user
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: Recipient can also be a user
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" }, // Optional: Recipient can also be a driver
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
