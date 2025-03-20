const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    unreadCount: { type: Map, of: Number, default: {} },
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, trim: true },
    groupInfo: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;
