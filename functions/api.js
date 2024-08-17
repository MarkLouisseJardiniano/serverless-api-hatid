
const express = require("express");
const serverless = require("serverless-http");
const router = require("./routes/auth");
const driverRouter = require("./routes/drivers")
const rideRouter = require("./routes/ride")
const fareRouter = require("./routes/fare")
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const dbCloudUrl =
  "mongodb+srv://Mawi:Mawi21@cluster0.twni9tv.mongodb.net/Hatid?retryWrites=true&w=majority&appName=Cluster0"; // your mongoDB Cloud URL

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(dbCloudUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB", error));

app.use("/.netlify/functions/api", router);
app.use("/.netlify/functions/api/driver", driverRouter);
app.use("/.netlify/functions/api/ride", rideRouter);
app.use("/.netlify/functions/api/admin-fare", fareRouter);


io.on("connection", (socket) => {
  console.log("New client connected");

  // Send previous messages
  Chat.find().then((messages) => {
    socket.emit("previousMessages", messages);
  });

  // Handle incoming messages
  socket.on("sendMessage", async (messageData) => {
    const newMessage = new Chat(messageData);
    await newMessage.save();
    io.emit("message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

module.exports.handler = serverless(app);
