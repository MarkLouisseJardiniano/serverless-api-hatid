const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../schema/auth');
const authenticateUser = require('../middleware/verify');

const router = express.Router();
const JWT_SECRET = "IWEFHsdfIHCW362weg47HGV3GB4678{]JKAsadFIH";

// Get all users (just an example, adjust as per your needs)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET);
    res.status(200).json({
      status: 'ok',
      data: {
        token,
        userId: user._id, // Include userId in the response
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.post('/signup', async (req, res) => {
  try {
    const { profilePic, name, email, password, number, birthday, address } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      profilePic: profilePic || '/images/default-profile.png',
      name,
      email,
      password: hashedPassword,
      number,
      birthday,
      address,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', name: user.name });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user data route
router.post('/userdata', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ status: 'ok', data: user });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update user data route
router.put('/edituser/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, number, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, { name, number, email }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ status: 'ok', data: updatedUser });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
