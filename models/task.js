const mongoose = require("mongoose");
const validator = require("validator");

const TaskSchema = new mongoose.Schema({
  taskname: { type: String, required: true },
  completed: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectID, required: true, ref: "User" },
  priority: { type: Number, required: true },
});

module.exports = mongoose.model("task", TaskSchema);
