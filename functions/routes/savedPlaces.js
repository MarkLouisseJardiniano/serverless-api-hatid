const express = require("express");
const router = express.Router();
const SavedPlace = require("../schema/savedPlaces")
const User = require("../schema/auth");



router.get("/saved-place", async (req, res) => {
    try {
      const savedPlaces = await SavedPlace.find();
      res.json(savedPlaces);
    } catch (err) {
      console.error("Error fetching Saved Places:", err);
      res.status(500).json({ message: "Server Error" });
    }
  });

  
router.post("/saved-place", async (req, res) => {
    const { userId , placeType, savedLocation } = req.body;
  
    if (!userId || placeType || savedLocation ) {
      return res.status(400).json({ error: "All fields are required" });
    }
    try {


        const newSavedPlaces = new SavedPlace({
            user: userId,
            placeType: placeType, 
            savedLocation
          });
      
          await newSavedPlaces.save();
          res.status(201).json({
            message: 'Saved Place Successfully',
            data: newSavedPlaces
          });
        } catch (error) {
          console.error("Error creating saved places:", error);
          res.status(500).json({ message: "Internal server error" });
        }
    
  });
module.exports = router;
