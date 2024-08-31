const cron = require('node-cron');
const express = require('express');
const router = express.Router();
const Subscription = require("./schema/subscriptionSchema");

cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const result = await Subscription.updateMany(
      {
        endDate: { $lt: now },
        status: { $in: ["Pending", "Completed"] }
      },
      { $set: { status: "Ended" } }
    );

    console.log("Expired subscriptions updated:", result);
  } catch (error) {
    console.error("Error updating expired subscriptions:", error);
  }
});

module.exports = router;
