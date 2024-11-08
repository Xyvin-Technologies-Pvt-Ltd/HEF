const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    uid: { type: String },
    memberId: { type: String },
    role: {
      type: String,
      enum: ["president", "secretary", "treasurer", "rep", "member"],
      default: "member",
    },
    image: { type: String },
    email: { type: String },
    phone: { type: String, trim: true },
    bio: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "rejected", "deleted", "blocked"],
      default: "inactive",
    },
    address: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
