const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    content: { type: String},
     attachments: [
      {
        url: { type: String, trim: true },
        type: { type: String, enum: ["image", "voice", "file", "video"] },
      },
    ],
    feed: { type: mongoose.Schema.Types.ObjectId, ref: "Feeds" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageModel);

module.exports = Message;
