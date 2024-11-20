const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    name: {type :String},
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
    },
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },

  { timestamps: true }
);

const District = mongoose.model("District", districtSchema);

module.exports = District;
