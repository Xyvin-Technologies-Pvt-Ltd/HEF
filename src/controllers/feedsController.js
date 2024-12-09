const responseHandler = require("../helpers/responseHandler");
const Feeds = require("../models/feedsModel");
const logActivity = require("../models/logActivityModel");
const User = require("../models/userModel");
// const sendInAppNotification = require("../utils/sendInAppNotification");
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

    const findFeeds = await Feeds.findById(id);
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
  let status = "failure";
  let errorMessage = null;
  try {
    const { pageNo = 1, status, limit = 10, search } = req.query;
    const skipCount = 10 * (pageNo - 1);

    const filter = {
      status: "unpublished",
    };
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
        authorName: user.author.name || "",
      };
    });
    status = "success";
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
      host: req.headers.host,
      agent: req.headers["user-agent"],
      status,
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

    // const toUser = await User.findById(findFeeds.author).select("fcm");
    // const fcmUser = [toUser.fcm];

    // await sendInAppNotification(
    //   fcmUser,
    //   `Your Feed request has been ${action}`,
    //   `Your Feed request has been ${action} for ${findFeeds.content}`,
    // );

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
    const findFeeds = await Feeds.find({ author: req.userId });

    if (!findFeeds) {
      return responseHandler(res, 404, "Feeds not found");
    }
    return responseHandler(res, 200, "Feeds found successfull..!", findFeeds);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
