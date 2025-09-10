const mongoose = require("mongoose");

const analyticSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Business", "One v One Meeting", "Referral"],
    },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String },
    description: { type: String },
    referral: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      info: { type: String },
    },
    contact: { type: String },
    amount: { type: Number },
    date: { type: Date },
    time: { type: String },
    meetingLink: { type: String },
    location: { type: String },
    supportingDocuments: { type: String },
    status: {
      type: String,
      enum: ["accepted", "pending", "meeting_scheduled", "rejected", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Analytic = mongoose.model("Analytic", analyticSchema);

module.exports = Analytic;
