const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Message schema
const messageSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (includes both users and drivers)
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (includes both users and drivers)
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
