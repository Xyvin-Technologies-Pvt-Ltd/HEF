const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    districts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "District",
      },
    ],
    admins: 
    [{ type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' }],
  },
  { timestamps: true }
);

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;
