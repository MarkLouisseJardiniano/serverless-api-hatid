const express = require("express");
const router = express.Router();
const Booking = require("../schema/ride");
const Driver = require("../schema/drivers");
const User = require("../schema/auth");
const Fare = require("../schema/fare")
const JWT_SECRET = "IWEFHsdfIHCW362weg47HGV3GB4678{]JKAsadFIH";
const authenticateUser = require("../middleware/verify");

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

router.get("/available", async (req, res) => {
  try {
    const { driverId } = req.query;
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const vehicleType = driver.vehicleInfo2.vehicleType;
    const currentBooking = await Booking.findOne({
      driver: driverId,
      status: { $in: ["accepted", "rejected"] }
    }).sort({ updatedAt: -1 });

    let query = {
      status: "pending",
      vehicleType: vehicleType
    };

    if (currentBooking) {
      query._id = { $ne: currentBooking._id };
    }

    const newBookings = await Booking.find(query).sort({ createdAt: 1 });
    res.status(200).json({ status: "ok", data: newBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server Error" });
  }
});router.get("/available/shared", async (req, res) => {
  try {
    // Define the query to find accepted shared rides
    const query = {
      status: "accepted",
      rideType: "Shared Ride"
    };

    // Fetch the shared rides from the database
    const sharedRides = await Booking.find(query).sort({ createdAt: 1 });

    // If no rides are found, return an empty array with a success status
    if (sharedRides.length === 0) {
      return res.status(200).json({ status: "ok", data: [] });
    }

    // Respond with the found rides
    res.status(200).json({ status: "ok", data: sharedRides });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error fetching shared rides:", error);

    // Respond with a 500 error if something goes wrong
    res.status(500).json({ message: "Server Error", error: error.message });
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

router.post("/create", async (req, res) => {
  const { userId, pickupLocation, destinationLocation, vehicleType, rideType, fare } = req.body;

  if (!userId || !pickupLocation || !destinationLocation || !vehicleType || !rideType || fare == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newBooking = new Booking({
      name: user.name,
      user: userId,
      pickupLocation,
      destinationLocation,
      vehicleType,
      rideType,
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


// Join Endpoint
router.post("/join", async (req, res) => {
  try {
    const { bookingId, userId, passengerLocation, vehicleType, rideType, fare } = req.body;

    console.log("Request body:", req.body); // Debug log

    // Validate required fields
    if (!bookingId || !userId || !passengerLocation || !vehicleType || !rideType || fare == null) {
      return res.status(400).json({ message: "Booking ID, User ID, Passenger Location, Vehicle Type, Ride Type, and Fare are required" });
    }

    // Find the existing booking
    const existingBooking = await Booking.findById(bookingId).populate('copassengers.userId');
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure the booking is accepted and a shared ride
    if (existingBooking.status !== "accepted") {
      return res.status(400).json({ message: "You can only join an accepted ride" });
    }

    if (existingBooking.rideType !== "Shared Ride") {
      return res.status(400).json({ message: "You can only join a shared ride" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the vehicle type matches
    if (existingBooking.vehicleType !== vehicleType) {
      return res.status(400).json({ message: "Vehicle type does not match the booking" });
    }

    // Prepare copassenger data
    const copassengerData = {
      user: userId,
      name: user.name,
      pickupLocation: passengerLocation.pickupLocation,
      destinationLocation: passengerLocation.destinationLocation,
      fare: fare,
      rideType: "Shared Ride",
      status: "pending", // Initial status can be 'pending'
    };

    // Check if the user is already a copassenger
    const existingCopassenger = existingBooking.copassengers.find(c => c.user.toString() === userId);
    if (existingCopassenger) {
      return res.status(400).json({ message: "User already joined this ride" });
    }

    // Push the new copassenger to the existing booking
    existingBooking.copassengers.push(copassengerData);

    // Save the updated booking
    await existingBooking.save();
    console.log("New Copassenger Added:", copassengerData); // Debug log for the copassenger

    return res.status(200).json({ status: "ok", message: "Successfully joined the ride", existingBooking });

  } catch (error) {
    console.error("Error occurred in /join:", error); // More specific error logging
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// Accept Endpoint
router.post("/accept", async (req, res) => {
  try {
    const { bookingId, driverId, latitude, longitude, userId } = req.body; // Expect userId from the copassenger

    // Log incoming request data
    console.log("Request body:", req.body);

    // Validate required fields
    if (!bookingId || !driverId || latitude == null || longitude == null || !userId) {
      return res.status(400).json({ message: "Booking ID, Driver ID, driver location, and user ID are required" });
    }

    // Find the booking and populate copassengers
    const booking = await Booking.findById(bookingId).populate('copassengers.user');
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the booking status is pending
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking not available or not pending" });
    }

    // Fetch the driver
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Check if the user accepting is a copassenger
    const copassenger = booking.copassengers.find(c => c.userId.toString() === userId);
    if (!copassenger) {
      return res.status(404).json({ message: "User not found among copassengers" });
    }

    // Update the copassenger status to accepted
    copassenger.status = "accepted";

    // If this is the primary user, update booking status and driver information
    if (userId.toString() === booking.user.toString()) {
      booking.status = "accepted"; // Only update if the primary user is accepting
      booking.driver = driverId;
      booking.driverLocation = { latitude, longitude };
    }

    // Save the updated booking
    await booking.save();

    // Respond with the accepted booking and copassenger
    res.status(200).json({
      status: "ok",
      data: {
        acceptedBooking: booking,
        acceptedCopassenger: copassenger, // Include the accepted copassenger
      },
    });
  } catch (error) {
    console.error("Error accepting booking:", error);
    res.status(500).json({ message: "Server Error" });
  }
});



router.delete("/delete-all", async (req, res) => {
  try {
    const result = await Booking.deleteMany({});
    res.status(200).json({ status: "ok", message: "All bookings deleted", deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting all bookings:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/cancel", async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status === "completed" || booking.status === "canceled") {
      return res.status(400).json({ message: "Booking cannot be canceled" });
    }

    booking.status = "canceled";
    const updatedBooking = await booking.save();

    res.status(200).json({ status: "ok", data: updatedBooking });
  } catch (error) {
    console.error("Error canceling booking:", error);
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

router.get("/activities/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const activities = await Booking.find({ user: userId }); 
    if (activities.length === 0) {
      return res.status(404).json({ message: 'No activities found for this user' });
    }

    res.status(200).json({ status: 'ok', data: activities });
  } catch (error) {
    console.error('Error getting activities data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get("/activities/driver/:driverId", async (req, res) => {
  try {
    const driverId = req.params.driverId;

    if (!driverId) {
      return res.status(400).json({ message: 'Driver ID is required' });
    }

    const activities = await Booking.find({ 
      driver: driverId,
      status: { $in: ['accepted', 'completed', 'cancelled'] }
     }); 
    if (activities.length === 0) {
      return res.status(404).json({ message: 'No activities found for this driver' });
    }

    res.status(200).json({ status: 'ok', data: activities });
  } catch (error) {
    console.error('Error getting activities data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Get passenger's Expo push token by booking ID
router.get("/booking/:id/passenger-token", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ expoPushToken: booking.passengerExpoPushToken }); // Assuming this field exists in your schema
  } catch (error) {
    console.error("Error fetching passenger token:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;
