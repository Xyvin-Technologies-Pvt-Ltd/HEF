const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: { type: String },
    image: { type: String },
    price: { type: Number },
    offerPrice: { type: Number },
    description: { type: String },
    moq: { type: Number },
    units: { type: String },
    tags: [{ type: String }],
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected", "reported"],
    },
    reason: { type: String },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
