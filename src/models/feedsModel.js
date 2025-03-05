const mongoose = require("mongoose");

const feedsSchema = mongoose.Schema(
  {
    type: {
      type: String,
      trim: true,
      enum: ["Information", "Job", "Funding", "Requirement"],
    },
    media: { type: String },
    link: { type: String, trim: true },
    content: { type: String, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    like: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comment: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        _id: false,
      },
    ],
    status: {
      type: String,
      trim: true,
      enum: ["published", "unpublished", "rejected", "reported"],
      default: "unpublished",
    },
    reason: { type: String },
  },
  { timestamps: true }
);

const Feeds = mongoose.model("Feeds", feedsSchema);

module.exports = Feeds;
