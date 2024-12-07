const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const Analytic = require("../models/analyticModel");

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

    const analytic = await Analytic.create(req.body);
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

      const { pageNo = 1, status, limit = 10, type } = req.query;
      const skipCount = 10 * (pageNo - 1);
      const filter = {};
      if (status) {
        filter.status = status;
      }
      if (type) {
        filter.type = type;
      }
      const totalCount = await Analytic.countDocuments(filter);
      const data = await Analytic.find(filter)
        .populate("sender", "name image")
        .populate("member", "name image")
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1, _id: 1 })
        .lean();

      return responseHandler(
        res,
        200,
        "Requests fetched successfully",
        data,
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
      if (filter === "sent") {
        username = data.member.name;
        user_image = data.member.image;
      } else if (filter === "received") {
        username = data.sender.name;
        user_image = data.sender.image;
      }

      return {
        username,
        user_image,
        title: data.title,
        status: data.status,
        time: data.createdAt,
        description: data.description,
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

    if (!requestId || !["accepted", "rejected"].includes(action)) {
      return responseHandler(
        res,
        400,
        "Invalid input: Request ID and action (accepted/rejected) are required."
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
