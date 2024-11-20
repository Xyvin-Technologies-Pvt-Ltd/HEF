const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    name: { type: String },
    zones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zone",
      },
    ],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const State = mongoose.model("State", stateSchema);

module.exports = State;
