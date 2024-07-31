<<<<<<< HEAD
const express = require("express");
const serverless = require("serverless-http");
const router = require("./routes/auth");
const driverRouter = require("./routes/drivers")
const rideRouter = require("./routes/ride")
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

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
module.exports.handler = serverless(app);
=======
const express = require('express');
const serverless = require('serverless-http');
const router = require('./routes/recipe');
const mongoose = require('mongoose');
const cors =  require('cors');

const app = express();

// your mongoDB Cloud URL

const dbCloudUrl =
'mongodb+srv://Mawi:Mawi21@cluster0.twni9tv.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0'; // your mongoDB Cloud URL

const dbLocalUrl = 'mongodb://localhost:27017/authors';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
.connect(dbCloudUrl || dbLocalUrl)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Failed to connect to MongoDB', error));

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
>>>>>>> 591c60e6ba13decd0ec21eb9e31a05bf75f2141d
