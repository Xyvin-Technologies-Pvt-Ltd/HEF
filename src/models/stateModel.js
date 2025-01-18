const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: {
    type: String,
    enum: ["president", "secretary", "treasurer"],
  },
});

const stateSchema = new mongoose.Schema(
  {
    name: { type: String },
    admins: [adminSchema],
  },
  { timestamps: true }
);

const State = mongoose.model("State", stateSchema);

module.exports = State;
