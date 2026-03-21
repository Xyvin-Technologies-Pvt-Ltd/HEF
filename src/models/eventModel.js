const mongoose = require("mongoose");

const moment = require("moment-timezone");
const TIMEZONE = "Asia/Kolkata";

const setEndOfDay = (value) => {
  if (!value) return value;
  return moment.tz(value, TIMEZONE).endOf("day").toDate();
};
const eventSchema = mongoose.Schema(
  {
    eventName: { type: String },
    description: { type: String },
    type: {
      type: String,
      enum: ["Online", "Offline"],
    },
    image: { type: String },
    eventDate: { type: Date },
    eventEndDate: { type: Date, set:setEndOfDay},
    startDate: { type: Date },
    startTime: { type: Date },
    endDate: { type: Date , set:setEndOfDay },
    endTime: { type: Date },
    platform: { type: String },
    link: { type: String },
    venue: { type: String },
    organiserName: { type: String },
    coordinator: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    limit: { type: Number },
    speakers: [
      {
        name: { type: String },
        designation: { type: String },
        role: { type: String },
        image: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "live", "completed", "cancelled"],
      default: "pending",
    },
    rsvp: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", },],
    rsvpnew: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        registeredDate: { type: Date, default: Date.now, },
      },
    ],
    attented: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isAllUsers: { type: Boolean, default: true },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    allowGuestRegistration: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true },
    guests: [
      {
        name: { type: String, required: true },
        contact: { type: String },
        category: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
