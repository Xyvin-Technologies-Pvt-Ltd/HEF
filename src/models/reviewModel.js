const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // to whome  get reviewed
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // the person who review
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
