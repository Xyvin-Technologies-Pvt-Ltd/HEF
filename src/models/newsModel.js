const mongoose = require("mongoose");

const NewsSchema = mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "Latest",
        "Current Affairs",
        "Trending",
        "History",
        "Entertainment",
        "Volunteering",
        "Events/ Programmes",
      ],
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
