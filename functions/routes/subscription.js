const express = require("express");
const router = express.Router();
const Subscription = require("../schema/subscriptionSchema");
const Driver = require("../schema/drivers");

router.get("/subscription", async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Check subscription status for driver online button
router.get("/subscription/status/:driverId", async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const subscription = await Subscription.findOne({ driver: driverId });
    
    if (!subscription || subscription.endDate < new Date()) {
      return res.status(200).json({ subscribed: false });
    }
    
    res.status(200).json({ subscribed: true });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/subscription/type/:driverId", async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const subscription = await Subscription.findOne({ driver: driverId });
    
    if (!subscription) {
      return res.status(200).json({ subscriptionType: null});
    }
    
    res.status(200).json({ 
     subscriptionType: subscription.subscriptionType});
  } catch (error) {
    console.error("Error checking subscription status:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// Create a new subscription
router.post("/subscription", async (req, res) => {
  try {
    const { driverId, subscriptionType, vehicleType } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "DriverId not found" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const existingSubscription = await Subscription.findOne({
      driver: driverId,
      endDate: { $gte: new Date() },
      status: { $in: ["Pending", "Completed"] }
    });

    if (existingSubscription) {
      return res.status(400).json({ message: "Driver already has an active subscription" });
    }

    const now = new Date();
    let endDate;

    if (subscriptionType === 'Free') {
      endDate = new Date(now.setDate(now.getDate() + 7));
    } else if (subscriptionType === 'Monthly') {
      endDate = new Date(now.setMonth(now.getMonth() + 1));
    } else if (subscriptionType === 'Quarterly') {
      endDate = new Date(now.setMonth(now.getMonth() + 3));
    } else if (subscriptionType === 'Annually') {
      endDate = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      endDate = now;
    }

    if (!['Jeep', 'Tricycle'].includes(vehicleType)) {
      return res.status(400).json({ message: 'Invalid vehicle type' });
    }

    const newSubscription = new Subscription({
      driver: driverId,
      subscriptionType,
      startDate: new Date(),
      endDate,
      vehicleType,
      status: "Pending",
      price: 0
    });

    await newSubscription.save();
    res.status(201).json(newSubscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Error creating subscription" });
  }
});

router.post("/payment-accept", async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ message: "SubscriptionId not found" });
    }

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    subscription.status = "Completed";
    await subscription.save();

    return res.status(200).json(subscription);

  } catch (error) {
    console.error("Error updating subscription status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/subscription/end-expired", async (req, res) => {
  try {
    const now = new Date();

    const updatedSubscriptions = await Subscription.updateMany(
      { endDate: { $lt: now }, status: { $in: ["Pending", "Completed"] } },
      { $set: { status: "Ended" } },
      { multi: true }
    );

    res.status(200).json({ message: "Expired subscriptions updated", updatedSubscriptions });
  } catch (error) {
    console.error("Error updating expired subscriptions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
