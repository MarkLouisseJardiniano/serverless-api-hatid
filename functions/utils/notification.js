// This file should include the WebSocket setup and the sendNotification function
const WebSocket = require('ws');

// Assuming WebSocket server is initialized here
const clients = new Map(); // Keep track of connected clients by userId

// Create a function to send a notification to a specific user
function sendNotification(userId, message) {
  const ws = clients.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ message }));
    console.log(`Notification sent to user ${userId}: ${message}`);
  } else {
    console.error(`WebSocket not open for user ${userId}`);
  }
}

module.exports = { sendNotification, clients };
