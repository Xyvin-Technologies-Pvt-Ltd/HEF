const mongoose = require("mongoose");

const feedsSchema = mongoose.Schema(
  {
    media: { type: String },
    content: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
