const mongoose = require("mongoose");

const ratingsAndFeedbacksSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
  },
}, { timestamps: true });

const RatingsAndFeedbacks = mongoose.model(
  "RatingsAndFeedbacks",
  ratingsAndFeedbacksSchema
);

module.exports = RatingsAndFeedbacks;
