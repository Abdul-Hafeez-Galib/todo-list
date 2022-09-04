const express = require("express");
const app = express();
const connectDB = require("./db/connect");
require("dotenv").config();

const port = process.env.PORT || 3000;
const userRoute = require("./routes/user");
const taskRoute = require("./routes/task");

// app.use(express.static("./public"));
app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log("App running"));
  } catch (error) {
    console.log(error);
  }
};

start();
