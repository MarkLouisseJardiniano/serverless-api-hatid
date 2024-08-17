const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Message schema
const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    required: true
  },
  senderType: {
    type: String,
    enum: ['User', 'Driver'],
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    required: true
  },
  receiverType: {
    type: String,
    enum: ['User', 'Driver'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

// Create a model from the schema
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
