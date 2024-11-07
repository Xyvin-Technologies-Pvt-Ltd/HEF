const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    eventName: { type: String },
    description: { type: String },
    type: {
      type: String,
      enum: ["Online", "Offline"],
    },
    image: { type: String },
    startDate: { type: Date },
    startTime: { type: Date },
    endDate: { type: Date },
    endTime: { type: Date },
    platform: { type: String },
    link: { type: String },
    venue: { type: String },
    organiserName: { type: String },
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
    rsvp: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
