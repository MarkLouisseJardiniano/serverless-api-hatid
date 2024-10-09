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

    // Validate that the driverId is provided
    if (!driverId) {
      console.error("Driver ID is required");
      return res.status(400).json({ message: "Driver ID is required" });
    }

    // Find the driver by ID
    const driver = await Driver.findById(driverId);
    if (!driver) {
      console.error(`Driver not found: ${driverId}`);
      return res.status(404).json({ message: "Driver not found" });
    }

    // Get the driver's vehicle type
    const vehicleType = driver.vehicleInfo2.vehicleType;

    // Check for the driver's current booking (accepted or rejected)
    const currentBooking = await Booking.findOne({
      driver: driverId,
      status: { $in: ["accepted", "rejected"] }
    }).sort({ updatedAt: -1 });

    // Build the query to find pending special and shared rides with "Create" action
    const query = {
      status: "pending",
      vehicleType: vehicleType,
      rideType: { $in: ["Special", "Shared Ride"] }, // Fetch only 'Special' and 'Shared' rides
      rideAction: "Create" // Ensure the rideAction is "Create"
    };

    // If the driver has a current booking, exclude it
    if (currentBooking) {
      query._id = { $ne: currentBooking._id };
    }

    // Fetch matching bookings sorted by creation date
    const newBookings = await Booking.find(query).sort({ createdAt: 1 });

    // Return the found bookings
    res.status(200).json({ status: "ok", data: newBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


router.get("/available/shared", async (req, res) => {
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
router.post("/create/special", async (req, res) => {
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
      rideType: "Special",
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

router.get("/joining/shared/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const currentBooking = await Booking.findById(bookingId);
    if (!currentBooking || currentBooking.rideType !== "Shared Ride") {
      return res.status(404).json({ message: "Shared ride not found" });
    }

    const joinBooking = await Booking.find({
      parentBooking: currentBooking._id,
      rideAction: "Join",
      status: ["pending","accepted"],
      vehicleType: currentBooking.vehicleType, // Ensure vehicle type matches
      rideType: "Shared Ride",
    }).sort({ createdAt: 1 }); // Get the earliest pending shared ride

    // Respond with the next available booking or a message if none found
    if (joinBooking.length > 0) {
      res.status(200).json({
        status: "ok",
        data: joinBooking,
      });
    } else {
      res.status(404).json({ message: "No pending join bookings available" });
    }
  } catch (error) {
    console.error("Error fetching next shared ride:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Create a new ride (special or shared)
router.post("/create/shared", async (req, res) => {
  const { userId, pickupLocation, destinationLocation, vehicleType, rideType, rideAction, fare } = req.body;

  // Validate required fields
  if (!userId || !pickupLocation || !destinationLocation || !vehicleType || !rideType || fare == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate rideAction only if rideType is "Shared"
  if (rideType === "Shared Ride" && !rideAction) {
    return res.status(400).json({ error: "Ride Action (Create or Join) is required for Shared Rides" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new booking for the ride
    const newBooking = new Booking({
      name: user.name,
      user: userId,
      pickupLocation,
      destinationLocation,
      vehicleType,
      rideType,
      rideAction: rideType === "Shared Ride" ? "Create" : null, // Only set rideAction for shared rides
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
// Join an existing shared ride
router.post("/join/shared", async (req, res) => {
  const { bookingId, userId, pickupLocation, destinationLocation, vehicleType, fare } = req.body;

  // Validate required fields
  if (!bookingId || !userId || !pickupLocation || !destinationLocation || !vehicleType || fare == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingBooking = await Booking.findById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if the booking is a shared ride that is in 'Create' mode
    if (existingBooking.rideType !== "Shared Ride" || existingBooking.rideAction === "Join") {
      return res.status(400).json({ error: "You can only join a shared ride that is in 'Create' status." });
    }

    // Ensure the driver has accepted the ride
    if (existingBooking.status !== "accepted") { // Fixed logical error
      return res.status(403).json({ error: "You cannot join this ride until the driver has accepted it." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new booking for the joining passenger
    const newBooking = new Booking({
      name: user.name,
      user: userId,
      pickupLocation,
      destinationLocation,
      vehicleType,
      rideType: "Shared Ride", // Keep rideType as shared
      rideAction: "Join", // Set action to Join
      fare,
      status: "pending",
      parentBooking: existingBooking._id, // Link to the parent shared ride
    });

    await newBooking.save();
    res.status(201).json({ 
      status: "ok", 
      message: "Successfully joined the shared ride", 
      bookingId: newBooking._id,
      name: user.name 
    });
  } catch (error) {
    console.error("Error joining ride:", error);
    res.status(500).json({ error: "Error joining the shared ride" });
  }
});
// Route to join a shared ride
router.post("/join/shared", async (req, res) => {
  const { bookingId, userId, pickupLocation, destinationLocation, vehicleType, fare } = req.body;

  // Validate required fields
  if (!bookingId || !userId || !pickupLocation || !destinationLocation || !vehicleType || fare == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingBooking = await Booking.findById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if the booking is a shared ride that is in 'Create' mode
    if (existingBooking.rideType !== "Shared Ride" || existingBooking.rideAction === "Join") {
      return res.status(400).json({ error: "You can only join a shared ride that is in 'Create' status." });
    }

    // Ensure the driver has accepted the ride
    if (existingBooking.status !== "accepted") {
      return res.status(403).json({ error: "You cannot join this ride until the driver has accepted it." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new booking for the joining passenger
    const newBooking = new Booking({
      name: user.name,
      user: userId,
      pickupLocation,
      destinationLocation,
      vehicleType,
      rideType: "Shared Ride", // Keep rideType as shared
      rideAction: "Join", // Set action to Join
      fare,
      status: "pending",
      parentBooking: existingBooking._id, // Link to the parent shared ride
    });

    await newBooking.save();
    res.status(201).json({
      status: "ok",
      message: "Successfully joined the shared ride",
      bookingId: newBooking._id,
      name: user.name,
    });
  } catch (error) {
    console.error("Error joining ride:", error);
    res.status(500).json({ error: "Error joining the shared ride" });
  }
});
router.post("/accept-copassenger", async (req, res) => {
  try {
    const { newBookingId, userId } = req.body; // Destructure userId from the request body

    // Ensure all required fields are present
    if (!newBookingId || !userId) {
      return res.status(400).json({ message: "New Booking ID and User ID are required." });
    }

    // Find the new booking that is being accepted, and populate the user's name
    const newBooking = await Booking.findById(newBookingId).populate('user', 'name');

    // Check if newBooking exists
    if (!newBooking) {
      return res.status(404).json({ message: "New booking not found." });
    }

    console.log("New booking details with populated user:", JSON.stringify(newBooking, null, 2));

    // Fetch user details to confirm it's correct
    const user = await User.findById(userId);
    console.log("User details:", user);

    // Ensure the parent booking is a shared ride
    const parentBooking = await Booking.findById(newBooking.parentBooking);
    if (!parentBooking || parentBooking.rideType !== "Shared Ride") {
      return res.status(400).json({ message: "Cannot accept a co-passenger in a non-shared ride." });
    }

    // Check if the user's name is populated correctly
    const userName = newBooking.user ? newBooking.user.name : null;
    if (!userName) {
      console.error("User name is not available in newBooking:", newBooking);
      return res.status(400).json({ message: "User name is not available." });
    }

    // Add co-passenger details to the parent booking
    parentBooking.copassengers.push({
      userId: userId, // Add userId from request body
      name: userName,  // Use the populated name from the user object
      pickupLocation: newBooking.pickupLocation,
      destinationLocation: newBooking.destinationLocation,
      fare: newBooking.fare,
      rideType: newBooking.rideType,
      status: "accepted",
    });

    // Update the status of the new booking
    newBooking.status = "accepted"; // Update status
    await newBooking.save(); // Save the updated booking

    // Save the updated parent booking
    await parentBooking.save();

    return res.status(200).json({
      status: "ok",
      message: "Co-passenger accepted and added to the booking.",
      booking: parentBooking,
    });

  } catch (error) {
    console.error("Error occurred:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
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
