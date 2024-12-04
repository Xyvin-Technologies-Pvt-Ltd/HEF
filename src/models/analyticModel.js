const mongoose = require("mongoose");

const analyticSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["Business", "One v One Meeting", "Training Session"],
  },
  member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String },
  description: { type: String },
  referral: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contact: { type: String },
  amount: { type: String },
  date: { type: String },
  time: { type: String },
  meetingLink: { type: String },
  location: { type: String },
  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending"
  },
});

const Analytic = mongoose.model("Analytic", analyticSchema);

module.exports = Analytic;
