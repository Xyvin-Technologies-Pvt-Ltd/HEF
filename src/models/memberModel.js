const mongoose = require("mongoose");

const memberSchema = mongoose.Schema(
  {
    name: { type: String },
    memberId: { type: String },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    contactInfo: Object,
    subscription: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
