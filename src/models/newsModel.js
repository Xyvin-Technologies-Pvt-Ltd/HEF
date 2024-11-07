const mongoose = require("mongoose");

const NewsSchema = mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Latest", "Business", "Entertainment", "Economy", "Politics", "Market"],
    },
    title: { type: String },
    content: { type: String },
    media: { type: String },
    status: {
      type: String,
      enum: ["published", "unpublished"],
      default: "unpublished",
    },
  },
  { timestamps: true }
);

const News = mongoose.model("News", NewsSchema);

module.exports = News;
