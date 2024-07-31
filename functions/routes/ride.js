
const express = require("express");
const router = express.Router();
const Booking = require("../schema/ride");
const Driver = require("../schema/drivers");
const User = require("../schema/auth");
const JWT_SECRET = "IWEFHsdfIHCW362weg47HGV3GB4678{]JKAsadFIH";
const authenticateUser = require("../middleware/verify");
const fareCalculate = require("../utils/fareCalculate")
const calculateDistance = require('../utils/calculateDistance');

// Get all bookings
router.get("/booking", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
// Get available bookings for drivers
router.get("/available", async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending" });
    res.status(200).json({ status: "ok", data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
router.get("/accepted", async (req, res) => {
  try {
    const acceptedBooking = await Booking.find({ status: "accepted" });
    res.status(200).json({ status: "ok", data: acceptedBooking });
  } catch (error) {
    console.error("Error fetching accepted bookings:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
// Create a new booking
router.post("/create", async (req, res) => {
  const { userId, pickupLocation, destinationLocation, vehicleType } = req.body;

  if (!userId || !pickupLocation || !destinationLocation || !vehicleType) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Fetch the user's details based on userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate the distance between the pickup and destination locations
    const distanceInKm = calculateDistance(pickupLocation, destinationLocation);
    console.log(`Distance in KM: ${distanceInKm}`);

    // Calculate the fare
    const fare = fareCalculate(vehicleType, distanceInKm);
    console.log(`Calculated Fare: ${fare}`);

    const newBooking = new Booking({
      name: user.name,
      user: userId,
      pickupLocation,
      destinationLocation,
      vehicleType,
      fare,
      status: "pending",
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Error creating booking" });
  }
});

// Accept a booking
router.post("/accept", async (req, res) => {
  try {
    const { bookingId, driverId } = req.body;

    if (!bookingId || !driverId) {
      return res
        .status(400)
        .json({ message: "Booking ID and Driver ID are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "pending") {
      return res.status(400).json({ message: "Booking not available" });
    }

    booking.status = "accepted";
    booking.driver = driverId;
    await booking.save();

    // Populate the driver information
    const updatedBooking = await Booking.findById(bookingId).populate("driver");

    res.status(200).json({ status: "ok", data: updatedBooking });
  } catch (error) {
    console.error("Error accepting booking:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/complete", async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "accepted") {
      return res.status(400).json({ message: "Booking not available" });
    }

    booking.status = "completed";
    const updatedBooking = await booking.save();

    res.status(200).json({ status: "ok", data: updatedBooking });
  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
// Get booking by ID and populate driver information
router.get("/booking/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("driver");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
