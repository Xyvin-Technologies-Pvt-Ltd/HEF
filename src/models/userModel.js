const { array, string } = require("joi");
const mongoose = require("mongoose");


const linkSchema = new mongoose.Schema(
  {
    name: { type: String },
    link: { type: String },
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    uid: { type: String },
    memberId: { type: String },
    bloodgroup: { type: String },
    role: {
      type: String,
      enum: ["president", "secretary", "treasurer", "rep", "member"],
      default: "member",
    },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    image: { type: String },
    email: { type: String },
    phone: { type: String, trim: true },
    secondaryPhone: [{ type: String, trim: true }],
    bio: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "deleted", "blocked"],
      default: "inactive",
    },
    address: { type: String },
    company: {
      name: { type: String },
      designation: { type: String },
      email: { type: String },
      websites: { type: String },
      phone: { type: String, trim: true },
    },
    businessCatogary: { type: String },
    businessSubCatogary: { type: String },
    social: [linkSchema],
    websites: [linkSchema],
    awards: [
      {
        image: { type: String },
        name: { type: String },
        authority: { type: String },
      },
    ],
    videos: [linkSchema],
    certificates: [linkSchema],
    otp: { type: Number },

    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
