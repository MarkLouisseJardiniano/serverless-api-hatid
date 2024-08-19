const express = require("express");
const router = express.Router();
const Subscription = require("../schema/subscriptionSchema");

router.get("/subscription", async (req, res) => {
    try {
      const subscription = await Subs.find();
      res.json(subscription);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      res.status(500).json({ message: "Server Error" });
    }
  });

router.post("/subscription", async (req,res) => {
    try {
        const {driverId, subscriptionType} = req.body;

        if(!driverId) {
            return res.status(200).json({message: "DriverId nt found"})
        }

        const driver =  await Subscription.findById(driverId);
        if(!driver) {
            return res.status(400).json({message: "Driver not found haha"})
        }

        const newSubscription = new Subscription({
            driver: driverId,
            subscriptionType
        });

        await newSubscription.save();
        res.status(201).json(newSubscription)
    } catch (error) {
        console.error("Error creating subs:", error);
        res.status(500).json({ error: "Error creating subs" });
    }
})

module.exports = router;