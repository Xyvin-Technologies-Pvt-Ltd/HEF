const responseHandler = require("../helpers/responseHandler");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const { getReceiverSocketId, chatNamespace, io } = require("../socket");
const sendInAppNotification = require("../utils/sendInAppNotification");
const validations = require("../validations");

exports.sendMessage = async (req, res) => {
  const { content, isGroup, feed } = req.body;
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
      status: "sent",
    };

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
      chatNamespace.to(to).emit("message", newMessage);
      let allUsers = chat.participants;
      allUsers = allUsers.filter((user) => user.toString() !== from);
      const allUsersFCM = await User.find({
        _id: { $in: allUsers },
      }).select("fcm");

      const fcmTokens = allUsersFCM.map((user) => user.fcm);

      await sendInAppNotification(
        fcmTokens,
        `New Message ${chat.groupName}`,
        content
      );
    } else {
      const receiverSocketId = getReceiverSocketId(to);
      const toUser = await User.findById(to).select("fcm");
      const fromUser = await User.findById(from).select("name");
      const fcmUser = [toUser.fcm];
      await sendInAppNotification(
        fcmUser,
        `New Message ${fromUser.name.first}`,
        content
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
      });

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
    const chats = await Chat.find({ participants: req.userId, isGroup: false })
      .populate("participants", "name image")
      .populate("lastMessage")
      .sort({ lastMessage: -1, _id: 1 })
      .exec();

    return responseHandler(res, 200, "Chat retrieved successfully!", chats);
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
    const { participantIds, groupName, groupInfo } = req.body;

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
    // const skipCount = 10 * (pageNo - 1);
    const group = await Chat.find({ isGroup: true })
      .populate("lastMessage")
      .sort({ createdAt: -1, _id: 1 })
      .lean();
    const totalCount = await Chat.countDocuments({ isGroup: true });
    const mappedData = group.map((item) => {
      return {
        _id: item._id,
        groupName: item.groupName,
        lastMessage: item.lastMessage?.content,
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
      .populate("participants", "name phone batch college memberId")
      .populate({
        path: "participants",
        populate: { path: "college" },
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
      let fullName = item.name.first;
      if (item.name.middle) {
        fullName += ` ${item.name.middle}`;
      }
      if (item.name.last) {
        fullName += ` ${item.name.last}`;
      }
      return {
        _id: item._id,
        name: fullName,
        phone: item.phone,
        batch: item.batch,
        college: item.college.collegeName,
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

    const group = await Chat.findById(id);
    if (!group) {
      return responseHandler(res, 404, `Group not found`);
    }
    return responseHandler(res, 200, `Group details`, group);
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
