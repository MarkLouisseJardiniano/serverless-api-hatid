const mongoose = require("mongoose");
const licenseSchema = require("./license");
const vehicleInfo1Schema = require("./vehicleInfo1");
const vehicleInfo2Schema = require("./vehicleInfo2");

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true,
    match: [/^\d{7,15}$/, "Phone number must be between 7 and 15 digits"]
  },
  birthday: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  license: licenseSchema,
  vehicleInfo1: vehicleInfo1Schema,
  vehicleInfo2: vehicleInfo2Schema
});

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
