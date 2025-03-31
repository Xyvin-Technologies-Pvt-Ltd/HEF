const responseHandler = require("../helpers/responseHandler");
const Feeds = require("../models/feedsModel");
const logActivity = require("../models/logActivityModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const sendInAppNotification = require("../utils/sendInAppNotification");
const validations = require("../validations");

exports.createFeeds = async (req, res) => {
  try {
    const createFeedsValidator = validations.createFeedsSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );

    if (createFeedsValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createFeedsValidator.error}`
      );
    }
    req.body.author = req.userId;
    const newFeeds = await Feeds.create(req.body);
    if (!newFeeds) {
      return responseHandler(res, 400, `Feeds creation failed...!`);
    }
    return responseHandler(
      res,
      201,
      `New Feeds created successfull..!`,
      newFeeds
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getFeeds = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "Feeds with this Id is required");
    }

    const findFeeds = await Feeds.findById(id).populate("author", "name image memberId");
    if (findFeeds) {
      return responseHandler(res, 200, `Feeds found successfull..!`, findFeeds);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deletefeeds = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Feeds with this Id is required");
    }

    const deleteFeeds = await Feeds.findByIdAndDelete(id);
    if (deleteFeeds) {
      return responseHandler(
        res,
        200,
        "Feeds deleted successfully!",
        deleteFeeds
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllFeeds = async (req, res) => {
  try {
    const { pageNo = 1, status, limit = 10 } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const currentUser = await User.findById(req.userId).select("blockedUsers");
    const blockedUsersList = currentUser.blockedUsers
      ? currentUser.blockedUsers
      : [];

    const filter = {
      status: "published",
      author: {
        $nin: [...blockedUsersList],
      },
    };
    const totalCount = await Feeds.countDocuments(filter);
    const data = await Feeds.find(filter)
      .populate({
        path: "comment.user",
        select: "name image",
      })
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    return responseHandler(
      res,
      200,
      `Feeds found successfull..!`,
      data,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllFeedsForAdmin = async (req, res) => {
  let Status = "failure";
  let errorMessage = null;
  try {
    const { pageNo = 1, limit = 10, search } = req.query;
    const skipCount = 10 * (pageNo - 1);

    const filter = {};

    if (search) {
      filter.$or = [{ type: { $regex: search, $options: "i" } }];
    }
    const totalCount = await Feeds.countDocuments(filter);
    const data = await Feeds.find(filter)
      .populate("author", "name")
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();
    const mappedData = data.map((user) => {
      return {
        ...user,
        authorName: user?.author?.name || "",
      };
    });
    Status = "success";
    return responseHandler(
      res,
      200,
      `Feeds found successfull..!`,
      mappedData,
      totalCount
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "feed",
      description: "Get admin details",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status: Status,
      errorMessage,
    });
  }
};

exports.getUserFeeds = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Feeds with this Id is required");
    }
    const findFeeds = await Feeds.find({ author: id });
    if (!findFeeds) {
      return responseHandler(res, 404, "Feeds not found");
    }
    return responseHandler(res, 200, "Feeds found successfull..!", findFeeds);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateFeeds = async (req, res) => {
  try {
    const { id, action } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Feeds with this Id is required");
    }

    const findFeeds = await Feeds.findById(id);
    if (!findFeeds) {
      return responseHandler(res, 404, "Feeds not found");
    }

    const toUser = await User.findById(findFeeds.author).select("fcm");
    const fcmUser = [toUser.fcm];

    await sendInAppNotification(
      fcmUser,
      `Your Feed request has been ${action}ed`,
      `Your Feed request has been ${action}ed for ${findFeeds.content}`,
      null,
      "my_feeds"
    );

    if (action === "accept") {
      const updateFeeds = await Feeds.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "published",
          },
        },
        { new: true }
      );

      return responseHandler(
        res,
        200,
        "Feeds accepted successfully",
        updateFeeds
      );
    } else if (action === "reject") {
      const updateFeeds = await Feeds.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "rejected",
            reason: req.body.reason,
          },
        },
        { new: true }
      );
      return responseHandler(
        res,
        200,
        "Feeds rejected successfully",
        updateFeeds
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getMyFeeds = async (req, res) => {
  try {
    const findFeeds = await Feeds.find({ author: req.userId }).populate({
      path: "comment.user",
      select: "name image",
    });
    if (!findFeeds) {
      return responseHandler(res, 404, "Feeds not found");
    }
    return responseHandler(res, 200, "Feeds found successfull..!", findFeeds);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.likeFeed = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Feeds with this Id is required");
    }

    const findFeeds = await Feeds.findById(id);
    if (!findFeeds) {
      return responseHandler(res, 404, "Feeds not found");
    }

    if (findFeeds.like.includes(req.userId)) {
      const updateFeeds = await Feeds.findByIdAndUpdate(
        id,
        {
          $pull: { like: req.userId },
        },
        { new: true }
      );
      return responseHandler(
        res,
        200,
        "Feeds unliked successfully",
        updateFeeds
      );
    }

    const updateFeeds = await Feeds.findByIdAndUpdate(
      id,
      {
        $push: { like: req.userId },
      },
      { new: true }
    );

    const toUser = await User.findById(updateFeeds.author).select("fcm");
    const fromUser = await User.findById(req.userId).select("name");
    const fcmUser = [toUser.fcm];

    if (req.userId !== String(updateFeeds.author)) {
      await sendInAppNotification(
        fcmUser,
        `${fromUser.name} Liked Your Post`,
        `${fromUser.name} Liked Your ${updateFeeds.content}`,
        null,
        "my_feeds"
      );

      await Notification.create({
        users: toUser._id,
        subject: `${fromUser.name} Liked Your Post`,
        content: `${fromUser.name} Liked Your ${updateFeeds.content}`,
        type: "in-app",
      });
    }

    return responseHandler(res, 200, "Feeds liked successfully", updateFeeds);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.commentFeed = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Feeds with this Id is required");
    }

    const findFeeds = await Feeds.findById(id);
    if (!findFeeds) {
      return responseHandler(res, 404, "Feeds not found");
    }

    const updateFeeds = await Feeds.findByIdAndUpdate(
      id,
      {
        $push: {
          comment: {
            user: req.userId,
            comment: req.body.comment,
          },
        },
      },
      { new: true }
    );

    const toUser = await User.findById(updateFeeds.author).select("fcm");
    const fromUser = await User.findById(req.userId).select("name");
    const fcmUser = [toUser.fcm];

    if (req.userId !== String(updateFeeds.author)) {
      await sendInAppNotification(
        fcmUser,
        `${fromUser.name} Commented Your Post`,
        `${fromUser.name} Commented Your ${updateFeeds.content}`,
        null,
        "my_feeds"
      );

      await Notification.create({
        users: toUser._id,
        subject: `${fromUser.name} Commented Your Post`,
        content: `${fromUser.name} Commented Your ${updateFeeds.content}`,
        type: "in-app",
      });
    }

    return responseHandler(
      res,
      200,
      "Feeds commented successfully",
      updateFeeds
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
