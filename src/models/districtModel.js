const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: {
    type: String,
    enum: ["president", "secretary", "treasurer"],
  },
});

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
