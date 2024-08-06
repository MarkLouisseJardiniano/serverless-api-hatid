const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
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
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
