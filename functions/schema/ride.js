// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  pickupLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  destinationLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  vehicleType: { type: String, enum: ['Tricycle', 'Jeep'], required: true }, // Add vehicleType field
  status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
