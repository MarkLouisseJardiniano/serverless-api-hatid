// message.js (Schema)
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'senderModel' 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'receiverModel' 
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Driver'] 
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Driver']
  },
  content: {
    type: String,
    required: true
  },
  dateTime: { 
    type: Date, 
    default: Date.now 
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
