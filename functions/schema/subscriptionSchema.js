const { refreshToken } = require("firebase-admin/app");
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  driver : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
  },
  subscriptionType: {
    type: String,
    required: true,
    enum: ["Free", "Monthly", "Quarterly", "Annually"]
  }

});

module.exports = subscriptionSchema;
