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
});
router.get("/available/shared", async (req, res) => {
  try {
    const query = {
      status: "accepted",
      rideType: "Shared Ride" 
    };

    const sharedRides = await Booking.find(query).sort({ createdAt: 1 });
    res.status(200).json({ status: "ok", data: sharedRides });
  } catch (error) {
    console.error("Error fetching shared rides:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/join", async (req, res) => {
  try {
    const { bookingId, userId, passengerLocation, vehicleType, rideType, fare } = req.body;

    console.log("Request body:", req.body);

    if (!bookingId || !userId || !passengerLocation || !vehicleType || !rideType || fare == null) {
      return res.status(400).json({ message: "Booking ID, User ID, Passenger Location, Vehicle Type, Ride Type, and Fare are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { pickupLocation, destinationLocation } = passengerLocation;

    booking.copassengers.push({
      user: userId,
      location: {
        pickupLocation: {
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
        },
        destinationLocation: {
          latitude: destinationLocation.latitude,
          longitude: destinationLocation.longitude,
        },
      },
      vehicleType,
      rideType,
      fare,
      status: "pending",
    });

    await booking.save();

    return res.status(200).json({ status: "ok", message: "Successfully joined the ride", booking });
  } catch (error) {
    console.error("Error occurred:", error); // Log the entire error object
    return res.status(500).json({ message: "Server Error", error: error.message });
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

router.post("/accept", async (req, res) => {
  try {
    const { bookingId, driverId, latitude, longitude } = req.body;

    // Validate required fields
    if (!bookingId || !driverId || latitude == null || longitude == null) {
      return res
        .status(400)
        .json({ message: "Booking ID, Driver ID, and driver location are required" });
    }

    // Find the booking and check if it's still pending
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "pending") {
      return res.status(400).json({ message: "Booking not available or not pending" });
    }

    // Fetch the driver
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Accept the booking by updating status and driver info
    booking.status = "accepted";
    booking.driver = driverId;
    booking.driverLocation = {
      latitude: latitude,
      longitude: longitude,
    };
    await booking.save();

    // Check if it's a shared ride
    let newBooking = null;
    if (booking.rideType === "Shared Ride") {
      newBooking = await Booking.findOne({
        status: "pending",
        vehicleType: booking.vehicleType, // Ensure vehicle type matches
        rideType: "Shared Ride",
      }).sort({ createdAt: 1 }); // Get the earliest pending shared ride
    }

    // Respond with accepted booking and any new shared booking
    res.status(200).json({
      status: "ok",
      data: {
        acceptedBooking: booking,
        newBooking: newBooking ? [newBooking] : [],
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
