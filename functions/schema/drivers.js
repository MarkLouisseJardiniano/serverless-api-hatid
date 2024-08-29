const mongoose = require("mongoose");
const licenseSchema = require("./license");
const vehicleInfo1Schema = require("./vehicleInfo1");
const vehicleInfo2Schema = require("./vehicleInfo2");

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  number: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^\d{7,15}$/, "Phone number must be between 7 and 15 digits"],
  },
  birthday: {
    type: Date,
    required: [true, "Birthday is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  license: {
    type: licenseSchema,
    required: [true, "License information is required"],
  },
  vehicleInfo1: {
    type: vehicleInfo1Schema,
    required: [true, "Vehicle info 1 is required"],
  },
  vehicleInfo2: {
    type: vehicleInfo2Schema,
    required: [true, "Vehicle info 2 is required"],
  },
  createdAt: { type: Date, default: Date.now },

});

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
