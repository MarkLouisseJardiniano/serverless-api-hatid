const cron = require('node-cron');
const axios = require('axios');

// Define the URL to your endpoint that updates expired subscriptions
const UPDATE_EXPIRED_URL = 'http://localhost:5000/subscription/end-expired'; // Adjust URL as needed

// Schedule the task to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const response = await axios.post(UPDATE_EXPIRED_URL);
    console.log('Expired subscriptions updated:', response.data);
  } catch (error) {
    console.error('Error updating expired subscriptions:', error);
  }
});
