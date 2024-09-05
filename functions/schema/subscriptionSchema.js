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

  const pricing = {
    Jeep: {
      None: 0,
      Free: 0,
      Monthly: 499,
      Quarterly: 1499,
      Annually: 4799,
    },
    Tricycle: {
      None: 0,
      Free: 0,
      Monthly: 399,
      Quarterly: 1299,
      Annually: 4599,
    },
  };

  subscription.price = pricing[subscription.vehicleType][subscription.subscriptionType];

  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
