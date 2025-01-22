const mongoose = require("mongoose");
const adminSchema = require("./adminSchema");

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    admins: [adminSchema],
  },
  { timestamps: true }
);

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;
