const express = require("express");
const router = express.Router();
const Contact = require("../schema/contacts")

router.get("/", async (req, res) => {
    try {
      const contacts = await Contact.find();
      res.json(contacts);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  // POST a new contact
  router.post("/add", async (req, res) => {
    const { userId, name, number } = req.body;
  
    // Check if any of the fields are missing
    if (!userId || !name || !number) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      const newContact = new Contact({
        user: userId,
        name,
        number,
      });
  
      await newContact.save();
      res.status(201).json({
        message: 'Added Contact Successfully',
        data: newContact
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // GET contacts by user ID
  router.get("/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const contacts = await Contact.find({ user: userId });
  
      if (contacts.length === 0) {
        return res.status(404).json({ message: "No contacts found for this user" });
      }
  
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts by user ID:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });
module.exports = router;
