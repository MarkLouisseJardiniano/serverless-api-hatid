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


router.post("/subscription", async (req, res) => {
  try {
    const { driverId, subscriptionType } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "DriverId not found" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(400).json({ message: "Driver not found" });
    }

    const newSubscription = new Subscription({
      driver: driverId,
      subscriptionType,
    });

    await newSubscription.save();
    res.status(201).json(newSubscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Error creating subscription" });
  }
});

module.exports = router;
