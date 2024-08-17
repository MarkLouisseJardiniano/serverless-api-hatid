const mongoose = require('mongoose');
const chatSchema = require('../schema/message');

const ChatModel = mongoose.model('Chat', chatSchema);

module.exports = ChatModel;