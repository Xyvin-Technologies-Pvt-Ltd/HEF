const mongoose = require("mongoose");
const adminSchema = require("./adminSchema");

const districtSchema = new mongoose.Schema(
  {
    name: { type: String },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
    },
    admins: [adminSchema],
  },

  { timestamps: true }
);

const District = mongoose.model("District", districtSchema);

module.exports = District;
