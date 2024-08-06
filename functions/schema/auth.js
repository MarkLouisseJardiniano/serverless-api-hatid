const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true,
    min: 7,
    max: 15
  },
  birthday: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
