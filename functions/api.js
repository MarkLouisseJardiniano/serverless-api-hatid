const express = require("express");
const serverless = require("serverless-http");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const router = require("./routes/auth");
const driverRouter = require("./routes/drivers");
const rideRouter = require("./routes/ride");
const fareRouter = require("./routes/fare");
const messageRouter = require("./routes/message");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const dbCloudUrl = "mongodb+srv://Mawi:Mawi21@cluster0.twni9tv.mongodb.net/Hatid?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(dbCloudUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB", error));

app.use("/.netlify/functions/api", router);
app.use("/.netlify/functions/api/driver", driverRouter);
app.use("/.netlify/functions/api/ride", rideRouter);
app.use("/.netlify/functions/api/admin-fare", fareRouter);
app.use("/.netlify/functions/api/message", messageRouter);

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("New client connected");

  // Fetch previous messages
  socket.on("fetchMessages", async ({ userId, recipientId }) => {
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    }).sort({ timestamp: 1 });
    socket.emit("previousMessages", messages);
  });

  // Handle incoming messages
  socket.on("sendMessage", async (messageData) => {
    const newMessage = new Message(messageData);
    await newMessage.save();
    io.emit("message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});


module.exports.handler = serverless(app);
