const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: {
      type: String,
      enum: ["president", "secretary", "treasurer"],
    },
  },
  { _id: false }
);

const stateSchema = new mongoose.Schema(
  {
    name: { type: String },
    admins: [roleSchema],
  },
  { timestamps: true }
);

const State = mongoose.model("State", stateSchema);

module.exports = State;
