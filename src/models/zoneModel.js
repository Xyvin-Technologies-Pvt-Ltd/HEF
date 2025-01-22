const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: {
    type: String,
    enum: ["president", "secretary", "treasurer"],
  },
});

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
