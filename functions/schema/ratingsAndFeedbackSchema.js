const mongoose = require("mongoose");

const ratingsAndFeedbacksSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: String,
    required: true
  },
  feedback: {
    type: String
  }
});

const RatingsAndFeedbacks = mongoose.model("RatingsAndFeedbacks", ratingsAndFeedbacksSchema);

module.exports = RatingsAndFeedbacks;
