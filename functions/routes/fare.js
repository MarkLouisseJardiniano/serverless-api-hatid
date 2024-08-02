const express = require("express");
const router = express.Router();
const Fare = require("../schema/fare");

// Create or update fare for a vehicle type
router.post("/admin-fare", async (req, res) => {
  const { vehicleType, baseFare, farePerKm, bookingFee } = req.body;

  if (!vehicleType || baseFare === undefined || farePerKm === undefined || bookingFee === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const fareDetails = await Fare.findOneAndUpdate(
      { vehicleType },
      { baseFare, farePerKm, bookingFee },
      { new: true, upsert: true }
    );
    res.status(200).json(fareDetails);
  } catch (error) {
    console.error("Error setting fare:", error);
    res.status(500).json({ error: "Error setting fare" });
  }
});

module.exports = router;
