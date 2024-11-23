const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    name: { type: String },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter", chapterSchema);

module.exports = Chapter;
