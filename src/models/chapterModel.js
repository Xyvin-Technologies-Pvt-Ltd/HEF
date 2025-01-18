const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: {
    type: String,
    enum: ["president", "secretary", "treasurer"],
  },
});

const chapterSchema = new mongoose.Schema(
  {
    name: { type: String },
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
