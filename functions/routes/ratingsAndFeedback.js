const express = require("express");
const router = express.Router();
const Ratings = require("../schema/ratingsAndFeedbackSchema");
const Driver = require("../schema/drivers");
const User = require("../schema/auth");
const Booking = require("../schema/ride");

// Route to get all ratings
router.get("/ratings", async (req, res) => {
  try {
    const ratings = await Ratings.find();
    res.json(ratings);
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/ratings/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params; // Get driverId from URL parameters

    if (!driverId) {
      return res.status(400).json({ message: "Driver ID is required." });
    }

    // Query ratings based on driverId
    const ratings = await Ratings.find({ driverId });

    if (ratings.length === 0) {
      return res.status(404).json({ message: "No ratings found for this driver." });
    }

    res.json(ratings);
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


// Route to create a new rating
router.post("/ratings/:driverId", async (req, res) => {
  try {
    const driverId = req.params.driverId; // Extract driverId from URL
    const { bookingId, userId, rating, feedback } = req.body;

    // Validate required fields
    if (!bookingId || !userId || !driverId) {
      return res.status(400).json({ message: "Booking ID, User ID, and Driver ID are required" });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(400).json({ message: "Booking not found" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(400).json({ message: "Driver not found" });
    }

    // Validate rating value
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    // Create and save new rating
    const newRatingsAndFeedback = new Ratings({
      booking: bookingId,
      user: userId,
      driver: driverId, // Use driverId from URL
      rating,
      feedback,
    });

    await newRatingsAndFeedback.save();
    res.status(201).json(newRatingsAndFeedback);
  } catch (error) {
    console.error("Error creating rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
