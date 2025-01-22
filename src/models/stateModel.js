const mongoose = require("mongoose");
const adminSchema = require("./adminSchema");

const stateSchema = new mongoose.Schema(
  {
    name: { type: String },
    admins: [adminSchema],
  },
  { timestamps: true }
);

const State = mongoose.model("State", stateSchema);

module.exports = State;
