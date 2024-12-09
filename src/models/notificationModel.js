const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    users: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        read: { type: Boolean, default: false },
      },
    ],
    subject: { type: String },
    content: { type: String },
    media: { type: String },
    link: { type: String },
    type: {
      type: String,
      enum: ["email", "in-app"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      enum: ["User", "Admin", "Cronjob"],
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
