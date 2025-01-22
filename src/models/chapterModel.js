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

const chapterSchema = new mongoose.Schema(
  {
    name: { type: String },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
    admins: [roleSchema],
  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter", chapterSchema);

module.exports = Chapter;
