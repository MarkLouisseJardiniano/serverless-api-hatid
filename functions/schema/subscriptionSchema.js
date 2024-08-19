const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  subscriptionType: {
    type: String,
    required: true,
    enum: ["Free", "Monthly", "Quarterly", "Annually"]
  }
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
