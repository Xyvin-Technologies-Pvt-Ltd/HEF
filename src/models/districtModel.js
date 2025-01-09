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

const districtSchema = new mongoose.Schema(
  {
    name: { type: String },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
    },
    admins: [roleSchema],
  },

  { timestamps: true }
);

const District = mongoose.model("District", districtSchema);

module.exports = District;
