const express = require("express");
const serverless = require("serverless-http");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIo = require('socket.io');
const router = require("./routes/auth");
const driverRouter = require("./routes/drivers");
const rideRouter = require("./routes/ride");
const fareRouter = require("./routes/fare");
const subsRouter = require("./routes/subscription");
const ratingRouter = require("./routes/ratingsAndFeedback");
const violateRouter = require("./routes/violation");
const savedPlacesRouter = require("./routes/savedPlaces");
const contactRouter = require("./routes/contacts");
const WebSocket = require('ws');
const notificationRoutes = require('./routes/ride'); // Import the routes
const { clients } = require('./utils/notification');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const dbCloudUrl = "mongodb+srv://Mawi:Mawi21@cluster0.twni9tv.mongodb.net/Hatid?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

wss.on('connection', (ws, req) => {
  const userId = req.url.split('?userId=')[1];
  clients.set(userId, ws);

  ws.on('close', () => {
    clients.delete(userId);
  });
});


mongoose.connect(dbCloudUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB", error));
app.use("/.netlify/functions/api", router);
app.use("/.netlify/functions/api/driver", driverRouter);
app.use("/.netlify/functions/api/ride", rideRouter);
app.use("/.netlify/functions/api/admin-fare", fareRouter);
app.use("/.netlify/functions/api/subs", subsRouter);
app.use("/.netlify/functions/api/rate", ratingRouter);
app.use("/.netlify/functions/api/violate", violateRouter);
app.use("/.netlify/functions/api/saved", savedPlacesRouter);
app.use("/.netlify/functions/api/contact", contactRouter);
app.use("/.netlify/functions/api/notification", notificationRoutes);


module.exports.handler = serverless(app);
