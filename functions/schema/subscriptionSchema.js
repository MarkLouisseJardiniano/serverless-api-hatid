const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  subscriptionType: {
    type: String,
    required: true,
    enum: ["None", "Free", "Monthly", "Quarterly", "Annually"],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ["Jeep", "Tricycle"],
  },
  status: {
    type: String,
    enum: ["Pending", "Completed","Ended", "Cancelled"],
    default: "pending",
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
 