const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Driver = require('../schema/drivers');

const router = express.Router();
const JWT_SECRET = "IWEFHsdfIHCW362weg47HGV3GB4678{]JKAsadFIH";

router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (err) {
        console.error('Error fetching drivers:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/driver/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(id);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json(driver);
  } catch (err) {
    console.error('Error fetching drive by ID:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/driver-signup', async (req, res) => {
  try {
    // Log the incoming request body to see what data is being received
    console.log('Request Body:', req.body);

    const { name, email, password, number, birthday, address, license, vehicleInfo1, vehicleInfo2 } = req.body;

    // Validate that all required fields are provided
    if (!name || !email || !password || !number || !birthday || !address || !license || !vehicleInfo1 || !vehicleInfo2) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if a driver with the same email already exists
    let driver = await Driver.findOne({ email });
    if (driver) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    // Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new driver instance with the received data
    driver = new Driver({
      name,
      email,
      password: hashedPassword,
      number,
      birthday,
      address,
      license,
      vehicleInfo1,
      vehicleInfo2
    });

    // Save the new driver to the database
    await driver.save();
    
    // Respond with success if the driver is created successfully
    res.status(201).json({ message: 'Driver created successfully', name: driver.name });
  } catch (error) {
    // Log the error details for debugging
    console.error('Error during signup:', error);
    
    // Send a more detailed error response if available, or a generic server error
    res.status(500).json({ message: error.message || 'Server Error' });
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
