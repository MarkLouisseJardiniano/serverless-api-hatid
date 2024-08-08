const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Driver = require('../schema/drivers');

const router = express.Router();
const JWT_SECRET = "IWEFHsdfIHCW362weg47HGV3GB4678{]JKAsadFIH";

// Get all users (just an example, adjust as per your needs)
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (err) {
        console.error('Error fetching drivers:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Signup route
router.post('/driver-signup', async (req, res) => {
  try {
    const { name, email, password, number, birthday, address } = req.body;

    let driver = await Driver.findOne({ email });
    if (driver) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    driver = new Driver({
      name,
      email,
      password: hashedPassword,
      number,
      birthday,
      address,
    });

    await driver.save();
    res.status(201).json({ message: 'Driver created successfully', name: driver.name });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login route
router.post('/driver-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ email: driver.email }, JWT_SECRET);
    res.status(200).json({
      status: 'ok',
      data: {
        token,
        driverId: driver._id, 
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user data route
router.post('/driverdata', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const driver = await Driver.findOne({ email: decoded.email });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json({ status: 'ok', data: driver });
  } catch (error) {
    console.error('Error retrieving driver data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update user data route
router.put('/editdriver/:id', async (req, res) => {
  try {
    const driverId = req.params.id;
    const { name, number, email } = req.body;

    const updatedDriver = await Driver.findByIdAndUpdate(driverId, { name, number, email }, { new: true });
    if (!updatedDriver) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ status: 'ok', data: updatedDriver });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
