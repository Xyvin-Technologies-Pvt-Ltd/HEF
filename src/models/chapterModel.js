const mongoose = require("mongoose");
const adminSchema = require("./adminSchema");

const chapterSchema = new mongoose.Schema(
  {
    name: { type: String },
    shortCode: { type: String },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
    admins: [adminSchema],
  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter", chapterSchema);

module.exports = Chapter;
