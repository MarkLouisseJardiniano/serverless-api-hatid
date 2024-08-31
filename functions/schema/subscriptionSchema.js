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
    enum: ["Pending", "Completed", "Ended", "Cancelled"],
    default: "Pending",
  },
  price: {
    type: Number,
    required: true,
  },
});

// Middleware to calculate price before saving
subscriptionSchema.pre("save", function (next) {
  const subscription = this;

  // Define pricing logic based on vehicle type and subscription type
  const pricing = {
    Jeep: {
      None: 0,
      Free: 0,
      Monthly: 500,
      Quarterly: 1400,
      Annually: 5000,
    },
    Tricycle: {
      None: 0,
      Free: 0,
      Monthly: 300,
      Quarterly: 800,
      Annually: 3000,
    },
  };

  // Calculate the price based on vehicle type and subscription type
  subscription.price = pricing[subscription.vehicleType][subscription.subscriptionType];

  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
