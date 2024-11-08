const mongoose = require("mongoose");

const feedsSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Information", "Job", "Funding", "Requirement"],
    },
    media: { type: String },
    link: { type: String },
    content: { type: String },
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
      enum: ["published", "unpublished", "rejected"],
      default: "unpublished",
    },
    reason: { type: String },
  },
  { timestamps: true }
);

const Feeds = mongoose.model("Feeds", feedsSchema);

module.exports = Feeds;
