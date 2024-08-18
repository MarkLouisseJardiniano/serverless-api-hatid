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
const messageRouter = require("./routes/message");

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server)

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

app.get('/', (req, res) => {
  res.send('Socket.io Server is running');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

module.exports.handler = serverless(app);
