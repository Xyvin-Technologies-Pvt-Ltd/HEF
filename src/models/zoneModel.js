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

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    admins: [roleSchema],
  },
  { timestamps: true }
);

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;
