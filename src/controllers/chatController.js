const responseHandler = require("../helpers/responseHandler");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { getReceiverSocketId, chatNamespace, io } = require("../socket");
const sendInAppNotification = require("../utils/sendInAppNotification");
const validations = require("../validations");

exports.sendMessage = async (req, res) => {
  const { content, isGroup, feed, product, attachments = [] } = req.body;
  const to = req.params.id;
  const from = req.userId;

  try {
    let chat;

    if (isGroup) {
      chat = await Chat.findById(to);
    } else {
      chat = await Chat.findOne({
        participants: { $all: [from, to] },
        isGroup: false,
      });
    }

    const newMessageData = {
      from,
      to,
      content,
      ...(attachments && { attachments }),
      status: "sent",
    };
    if (product) {
      newMessageData.product = product;
      product_sent = await Product.findById(product);
    }
    if (feed) {
      newMessageData.feed = feed;
    }

    const newMessage = new Message(newMessageData);

    if (!chat) {
      if (isGroup) {
        chat = new Chat({
          _id: to,
          participants: [from],
          lastMessage: newMessage._id,
          unreadCount: {},
        });
      } else {
        chat = new Chat({
          participants: [from, to],
          lastMessage: newMessage._id,
          unreadCount: { [to]: 1 },
          isGroup: false,
        });
      }
    } else {
      chat.lastMessage = newMessage._id;
      if (isGroup) {
        chat.participants.forEach((participant) => {
          if (participant.toString() !== from) {
            chat.unreadCount.set(
              participant.toString(),
              (chat.unreadCount.get(participant.toString()) || 0) + 1
            );
          }
        });
      } else {
        chat.unreadCount.set(to, (chat.unreadCount.get(to) || 0) + 1);
      }
    }

    await Promise.all([chat.save(), newMessage.save()]);

    await newMessage.populate({
      path: "feed",
      select: "media",
    });

    if (isGroup) {
      await newMessage.populate("from", "name image");
      let allUsers = chat.participants;
      allUsers = allUsers.filter((user) => user.toString() !== from);
      const allUsersFCM = await User.find({
        _id: { $in: allUsers },
      }).select("fcm");

      const fcmTokens = allUsersFCM.map((user) => user.fcm);

      await sendInAppNotification(
        fcmTokens,
        `New Message ${chat.groupName || "Group"}`,
        content || "New attachment",
        null,
        "group_chat",
        to,
        {
          senderId: from.toString(),
          isGroup: "true",
        }
      );
      for (const user of allUsers) {
        const receiverSocketId = getReceiverSocketId(user.toString());
        if (receiverSocketId) {
          const socketData = {
            ...newMessage._doc,
            isGroup: true,
          };
          chatNamespace.to(receiverSocketId).emit("message", socketData);
        }
      }
    } else {
      const receiverSocketId = getReceiverSocketId(to);
      const toUser = await User.findById(to).select("fcm");
      const fromUser = await User.findById(from).select("name");
      const fcmUser = [toUser.fcm];
      await sendInAppNotification(
        fcmUser,
        `New Message ${fromUser?.name || "User"}`,
        content || "New attachment",
        null,
        "chat",
        from.toString(),
        {
          senderId: from.toString(),
          isGroup: "false",
        }
      );
      if (receiverSocketId) {
        chatNamespace.to(receiverSocketId).emit("message", newMessage);
      } else {
        console.log("Receiver is not online.");
      }
    }
    return responseHandler(res, 201, "Message sent successfully!", newMessage);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getBetweenUsers = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;
  try {
    const messages = await Message.find({
      $or: [
        { from: id, to: userId },
        { from: userId, to: id },
      ],
    })
      .sort({ createdAt: 1, _id: 1 })
      .populate({
        path: "feed",
        select: "media",
      })
      .populate("product", "name image price");

    // Soft-deleted tombstones: keep row for timeline, clear sensitive payload
    for (const msg of messages) {
      if (msg.isDeleted) {
        msg.content = "";
        msg.attachments = [];
        msg.feed = undefined;
        msg.product = undefined;
      }
    }

    await Message.updateMany(
      { from: userId, to: id, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );

    await Chat.updateOne(
      { participants: { $all: [id, userId] } },
      { $set: { [`unreadCount.${userId}`]: 0 } }
    );

    return responseHandler(
      res,
      200,
      "Messages retrieved successfully!",
      messages
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getChats = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const chats = await Chat.find({ participants: req.userId, isGroup: false })
      .skip(skipCount)
      .limit(limit)
      .populate("participants", "name image")
      .populate("lastMessage")
      .sort({ lastMessage: -1, _id: 1 })
      .exec();

    for (const chat of chats) {
      if (chat.lastMessage && chat.lastMessage.isDeleted) {
        chat.lastMessage.content = "";
        chat.lastMessage.attachments = [];
      }
    }

    const totalCount = await Chat.countDocuments({
      participants: req.userId,
      isGroup: false,
    });

    return responseHandler(
      res,
      200,
      "Chat retrieved successfully!",
      chats,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { error } = validations.createGroupSchame.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const { groupName, groupInfo, chapter } = req.body;

    let { participantIds } = req.body;

    if (participantIds[0] === "*") {
      participantIds = [];
      const users = await User.find({ chapter: chapter });
      participantIds = users.map((user) => user._id);
    }

    const newChat = new Chat({
      participants: participantIds,
      groupName,
      groupInfo,
      isGroup: true,
      unreadCount: participantIds.reduce((acc, userId) => {
        acc[userId] = 0;
        return acc;
      }, {}),
    });

    await newChat.save();

    return responseHandler(
      res,
      201,
      "Group chat created successfully!",
      newChat
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getGroupMessage = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const messages = await Message.find({
      to: id,
    })
      .sort({ createdAt: 1, _id: 1 })
      .populate("from", "name image");

    for (const msg of messages) {
      if (msg.isDeleted) {
        msg.content = "";
        msg.attachments = [];
      }
    }

    if (!messages.length) {
      return responseHandler(res, 404, "No messages found in this group.");
    }

    await Message.updateMany(
      { to: id, status: { $ne: "seen" }, from: { $ne: userId } },
      { status: "seen" }
    );

    await Chat.updateOne(
      { _id: id },
      { $set: { [`unreadCount.${userId}`]: 0 } }
    );

    return responseHandler(
      res,
      200,
      "Group messages retrieved successfully!",
      messages
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getGroupList = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const group = await Chat.find({ isGroup: true, participants: req.userId })
      .skip(skipCount)
      .limit(limit)
      .populate("lastMessage")
      .sort({ createdAt: -1, _id: 1 })
      .lean();
    const totalCount = await Chat.countDocuments({
      isGroup: true,
      participants: req.userId,
    });
    const mappedData = group.map((item) => {
      const last = item.lastMessage;
      const lastPreview =
        last && last.isDeleted
          ? "This message was deleted"
          : last?.content || "";
      return {
        _id: item._id,
        groupName: item.groupName,
        lastMessage: lastPreview,
        unreadCount: item.unreadCount[req.userId] || 0,
      };
    });

    return responseHandler(
      res,
      200,
      `Group list found successfull..!`,
      mappedData,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getGroupListForAdmin = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10, search } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {
      isGroup: true,
    };

    if (search) {
      filter.$or = [{ groupName: { $regex: search, $options: "i" } }];
    }

    const group = await Chat.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();
    const totalCount = await Chat.countDocuments(filter);
    const mappedData = group.map((item) => {
      return {
        _id: item._id,
        groupName: item.groupName,
        groupInfo: item.groupInfo,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        memberCount: item.participants.length,
      };
    });

    return responseHandler(
      res,
      200,
      `Group list found successfull..!`,
      mappedData,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getGroupDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, `Group id is required`);
    }

    const group = await Chat.findById(id)
      .populate("participants", "name phone chapter memberId image")
      .populate({
        path: "participants",
        populate: { path: "chapter" },
      });
    if (!group) {
      return responseHandler(res, 404, `Group not found`);
    }

    const groupInfo = {
      groupName: group.groupName,
      groupInfo: group.groupInfo,
      memberCount: group.participants.length,
    };

    const participantsData = group.participants.map((item) => {
      let fullName = item.name;
      return {
        _id: item._id,
        name: fullName,
        phone: item.phone,
        image: item.image,
        chapter: item.chapter.name,
        memberId: item.memberId ? item.memberId : null,
        status: item.status,
      };
    });
    return responseHandler(res, 200, `Group details`, {
      groupInfo,
      participantsData,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.editGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, `Group id is required`);
    }
    const { error } = validations.editGroupSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const { groupName, groupInfo, participantIds } = req.body;

    const updateGroup = await Chat.findByIdAndUpdate(
      id,
      {
        groupName,
        groupInfo,
        participants: participantIds,
      },
      { new: true }
    );
    if (updateGroup) {
      return responseHandler(
        res,
        200,
        "Group updated successfully!",
        updateGroup
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, `Group id is required`);
    }

    const group = await Chat.findById(id).populate({
      path: "participants",
      select: "name phone chapter memberId",
      populate: {
        path: "chapter",
        select: "name",
        populate: {
          path: "districtId",
          select: "name",
          populate: {
            path: "zoneId",
            select: "name",
            populate: {
              path: "stateId",
              select: "name",
            },
          },
        },
      },
    });
    if (!group) {
      return responseHandler(res, 404, `Group not found`);
    }
    return responseHandler(res, 200, `Group details`, group);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};


/**
 * Soft-delete a message (own messages only).
 * DELETE /api/v1/chat/delete-message/:messageId
 * Emits socket event: message_deleted for peer sync.
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    const mongoose = require("mongoose");

    if (!messageId) {
      return responseHandler(res, 400, "Message id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return responseHandler(res, 400, "Invalid message id");
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return responseHandler(res, 404, "Message not found");
    }

    if (message.from.toString() !== userId.toString()) {
      return responseHandler(
        res,
        403,
        "You can only delete your own messages"
      );
    }

    if (message.isDeleted) {
      const already = message.toObject();
      already.content = "";
      already.attachments = [];
      return responseHandler(res, 200, "Message already deleted", already);
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    // Keep content for audit on server; clients should hide body when isDeleted
    await message.save();

    // If this was the chat's lastMessage, point to previous non-deleted message
    const chatsWithLast = await Chat.find({ lastMessage: message._id });
    for (const chat of chatsWithLast) {
      let previous = null;
      if (chat.isGroup) {
        previous = await Message.findOne({
          to: chat._id,
          isDeleted: { $ne: true },
        }).sort({ createdAt: -1, _id: -1 });
      } else {
        const participantIds = (chat.participants || []).map((p) =>
          p.toString()
        );
        if (participantIds.length >= 2) {
          previous = await Message.findOne({
            isDeleted: { $ne: true },
            $or: [
              { from: participantIds[0], to: participantIds[1] },
              { from: participantIds[1], to: participantIds[0] },
            ],
          }).sort({ createdAt: -1, _id: -1 });
        }
      }
      chat.lastMessage = previous ? previous._id : null;
      await chat.save();
    }

    // Realtime notify peers (single event name to avoid double client handling)
    const payloadBase = {
      _id: message._id.toString(),
      from: message.from.toString(),
      to: message.to ? message.to.toString() : null,
      content: "",
      attachments: [],
      status: message.status,
      isDeleted: true,
      deletedAt: message.deletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    const emitDeleted = (receiverId, isGroup) => {
      const socketId = getReceiverSocketId(receiverId.toString());
      if (!socketId) return;
      const payload = isGroup
        ? {
            ...payloadBase,
            isGroup: true,
            // Group client model expects from as user object
            from: { _id: message.from.toString() },
          }
        : { ...payloadBase, isGroup: false };
      chatNamespace.to(socketId).emit("message_deleted", payload);
    };

    // Determine group vs 1:1 from Chat document if possible
    const groupChat = await Chat.findById(message.to);
    if (groupChat && groupChat.isGroup) {
      for (const participant of groupChat.participants) {
        if (participant.toString() === userId.toString()) continue;
        emitDeleted(participant, true);
      }
    } else {
      // 1:1 — message.to is the peer user id
      const peerId =
        message.from.toString() === userId.toString()
          ? message.to
          : message.from;
      if (peerId) emitDeleted(peerId, false);
    }

    const responseBody = message.toObject();
    responseBody.content = "";
    responseBody.attachments = [];
    return responseHandler(
      res,
      200,
      "Message deleted successfully",
      responseBody
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, `Group id is required`);
    }
    const deleteGroup = await Chat.findByIdAndDelete(id);
    if (deleteGroup) {
      return responseHandler(
        res,
        200,
        "Group deleted successfully!",
        deleteGroup
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
