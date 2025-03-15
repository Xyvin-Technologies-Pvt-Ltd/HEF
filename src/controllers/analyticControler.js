const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const Analytic = require("../models/analyticModel");
const checkAccess = require("../helpers/checkAccess");
const User = require("../models/userModel");
const sendInAppNotification = require("../utils/sendInAppNotification");

exports.sendRequest = async (req, res) => {
  try {
    if (req.role === "admin") {
      const check = await checkAccess(req.roleId, "permissions");
      if (!check || !check.includes("activityManagement_modify")) {
        return responseHandler(
          res,
          403,
          "You don't have permission to perform this action"
        );
      }
    }

    const { error } = validations.createAnalyticSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    if (req.role !== "admin") {
      req.body.sender = req.userId;
    }

    const user = await User.findById(req.body.member);

    const analytic = await Analytic.create(req.body);
    if (analytic) {
      await sendInAppNotification(
        user.fcm,
        "You have a new request",
        `You have a new request. Regarding the ${req.body.type} request.`,
        null,
        "analytic",
        analytic._id
      );
    }
    return responseHandler(res, 201, "Request created successfully", analytic);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getRequests = async (req, res) => {
  try {
    if (req.role === "admin") {
      const check = await checkAccess(req.roleId, "permissions");
      if (!check || !check.includes("activityManagement_view")) {
        return responseHandler(
          res,
          403,
          "You don't have permission to perform this action"
        );
      }

      const {
        pageNo = 1,
        status,
        limit = 10,
        requestType,
        user,
        type,
        startDate,
        endDate,
      } = req.query;
      const skipCount = 10 * (pageNo - 1);
      const filter = {};

      if (user) {
        filter.$or = [{ sender: user }, { member: user }];
      }

      if (status) {
        filter.status = status;
      }

      if (requestType || type) filter.type = type;

      if (startDate && endDate) {
        filter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const totalCount = await Analytic.countDocuments(filter);
      const data = await Analytic.find(filter)
        .populate("sender", "name image")
        .populate("member", "name image")
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1, _id: 1 })
        .lean();

      const adminData = data.map((user) => {
        return {
          ...user,
          senderName: user.sender?.name || "",
          memberName: user.member?.name || "",
          referralName: user.referral?.name || "",
        };
      });

      return responseHandler(
        res,
        200,
        "Requests fetched successfully",
        adminData,
        totalCount
      );
    }

    const { userId } = req;
    const { filter, type } = req.query;

    let query;
    if (filter === "sent") {
      query = { sender: userId };
    } else if (filter === "received") {
      query = { member: userId };
    } else {
      query = { $or: [{ sender: userId }, { member: userId }] };
    }

    if (type) {
      query.type = type;
    }

    const response = await Analytic.find(query)
      .populate("sender", "name image")
      .populate("member", "name image");

    const mappedData = response.map((data) => {
      let username;
      let user_image;
      let user_id;

      if (filter === "sent") {
        user_id = data.member?._id;
        username = data.member?.name || "";
        user_image = data.member?.image || "";
      } else if (filter === "received") {
        user_id = data.sender?._id;
        username = data.sender?.name || "";
        user_image = data.sender?.image || "";
      } else {
        user_id =
          req.userId === data.sender?._id
            ? data.member?._id
            : data.sender?._id || "";
        username =
          req.userId === data.sender?._id
            ? data.member?.name
            : data.sender?.name || "";
        user_image =
          req.userId === data.sender?._id
            ? data.member?.image
            : data.sender?.image || "";
      }

      return {
        _id: data._id,
        username,
        user_id,
        user_image,
        title: data.title,
        status: data.status,
        time: data.time,
        date: data.date,
        description: data.description,
        type: data.type,
        amount: data.amount,
      };
    });

    return responseHandler(
      res,
      200,
      "Requests fetched successfully",
      mappedData
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    if (
      !requestId ||
      !["accepted", "rejected", "meeting_scheduled"].includes(action)
    ) {
      return responseHandler(
        res,
        400,
        "Invalid input: Request ID and action (accepted/rejected/meeting_scheduled) are required."
      );
    }

    const updatedRequest = await Analytic.findByIdAndUpdate(
      requestId,
      { status: action },
      { new: true }
    );

    if (!updatedRequest) {
      return responseHandler(res, 404, "Request not found.");
    }

    return responseHandler(
      res,
      200,
      `Request successfully ${action}.`,
      updatedRequest
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.deleteRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!requestId) {
      return responseHandler(res, 400, "Request ID is required.");
    }

    const deletedRequest = await Analytic.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return responseHandler(res, 404, "Request not found.");
    }

    return responseHandler(
      res,
      200,
      "Request successfully deleted.",
      deletedRequest
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getRequestsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!chapterId) {
      return responseHandler(res, 400, "Chapter ID is required.");
    }

    const requests = await Analytic.find({
      $or: [
        {
          member: {
            $in: await User.find({ chapter: chapterId }).select("_id"),
          },
        },
        {
          sender: {
            $in: await User.find({ chapter: chapterId }).select("_id"),
          },
        },
      ],
    })
      .populate({
        path: "member",
        select: "name email role chapter",
      })
      .populate({
        path: "sender",
        select: "name email role chapter",
      });

    if (requests.length === 0) {
      return responseHandler(
        res,
        404,
        "No requests found for the specified chapter."
      );
    }

    return responseHandler(
      res,
      200,
      "Requests retrieved successfully.",
      requests
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
