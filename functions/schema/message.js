const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true }, // Sender can be a user or driver
  receiver: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverModel', required: true }, // Receiver can be a user or driver
  timestamp: { type: Date, default: Date.now },
  senderModel: { type: String, required: true, enum: ['User', 'Driver'] }, // Model type for sender
  receiverModel: { type: String, required: true, enum: ['User', 'Driver'] } // Model type for receiver
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
