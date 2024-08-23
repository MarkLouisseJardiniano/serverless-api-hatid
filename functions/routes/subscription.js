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

// Route to check subscription status
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

    // Determine subscription duration
    const now = new Date();
    let endDate;

    if (subscriptionType == 'Free') {
      endDate = new Date(now.setDate(now.getDate() + 7));
    } else if (subscriptionType == 'Monthly') {
      endDate = new Date(now.setMonth(now.getMonth() + 1));
    } else if (subscriptionType == 'Quarterly') {
      endDate = new Date(now.setMonth(now.getMonth() + 3));
    } else if (subscriptionType == 'Annually') {
      endDate = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      endDate = now; 
    }

    
    if (!['jeep', 'tricycle'].includes(vehicleType)) {
      return res.status(400).json({ message: 'Invalid vehicle type' });
    }

    const newSubscription = new Subscription({
      driver: driverId,
      subscriptionType,
      startDate: new Date(),
      endDate,
      vehicleType
    });

    await newSubscription.save();
    res.status(201).json(newSubscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Error creating subscription" });
  }
});


module.exports = router;
