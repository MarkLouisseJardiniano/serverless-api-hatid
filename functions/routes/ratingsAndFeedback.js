const express = require("express");
const router = express.Router();
const Ratings= require("../schema/ratingsAndFeedbackSchema");
const Driver = require("../schema/drivers");
const User = require("../schema/auth");
const Booking = require("../schema/ride");


router.get("/ratings", async (req, res) => {
  try {
    const ratings = await Ratings.find();
    res.json(ratings);
  } catch (err) {
    console.error("Error fetching rating:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


router.post("/ratings", async (req, res) => {
  try {
    const { bookingId, driverId, userId, rating, feedback } = req.body;

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

    const newRatingsAndFeedback = new Ratings({
      booking: bookingId,
      driver: driverId,
      user: userId,
      rating,
      feedback,
    });

    await newRatingsAndFeedback.save();
    res.status(201).json(newRatingsAndFeedback);
  } catch (error) {
    console.error("Error creating rating:", error);
    res.status(500).json({ error: "Error creating rating" });
  }
});

module.exports = router;
