const express = require("express");
const router = express.Router();
const Violations = require("../schema/violationSchema");
const Driver = require("../schema/drivers");
const User = require("../schema/auth");
const Booking = require("../schema/ride");


router.get("/violation", async (req, res) => {
  try {
    const violations = await Violations.find();
    res.json(violations);
  } catch (err) {
    console.error("Error fetching violation:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


router.post("/violation", async (req, res) => {
  try {
    const { bookingId, driverId, userId, report } = req.body;

    if (!bookingId || !driverId || !userId) {
      return res.status(400).json({ message: "Ids not found" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(400).json({ message: "Booking not found" });
    }
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(400).json({ message: "Driver not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const newViolation = new Violations({
      booking: bookingId,
      driver: driverId,
      user: userId,
      report
    });

    await newViolation.save();
    res.status(201).json(newViolation);
  } catch (error) {
    console.error("Error creating violation:", error);
    res.status(500).json({ error: "Error creating violation" });
  }
});

module.exports = router;
