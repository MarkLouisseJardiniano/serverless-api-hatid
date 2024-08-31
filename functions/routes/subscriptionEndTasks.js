const Subscription = require("../schema/subscriptionSchema");

const updateExpiredSubscriptions = async () => {
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
};

const startScheduledTasks = () => {
  setInterval(updateExpiredSubscriptions, 3000); 
};

module.exports = { startScheduledTasks };
