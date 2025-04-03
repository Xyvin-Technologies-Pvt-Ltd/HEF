const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const Analytic = require("../models/analyticModel");
const checkAccess = require("../helpers/checkAccess");
const User = require("../models/userModel");
const sendInAppNotification = require("../utils/sendInAppNotification");
const mongoose = require("mongoose");

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
        user,
        type,
        startDate,
        endDate,
        chapter,
      } = req.query;
      const skipCount = Number(limit) * (pageNo - 1);

      const matchStage = {};

      if (user) {
        matchStage.$or = [{ sender: user }, { member: user }];
      }

      if (status) {
        matchStage.status = status;
      }

      if (type) {
        matchStage.type = type;
      }

      if (startDate && endDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);
        matchStage.date = { $gte: start, $lte: end };
      }

      const pipeline = [{ $match: matchStage }];

      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            as: "senderData",
          },
        },
        { $unwind: "$senderData" },
        {
          $lookup: {
            from: "users",
            localField: "member",
            foreignField: "_id",
            as: "memberData",
          },
        },
        { $unwind: "$memberData" }
      );

      if (chapter) {
        pipeline.push({
          $match: {
            $or: [
              { "senderData.chapter": new mongoose.Types.ObjectId(chapter) },
              { "memberData.chapter": new mongoose.Types.ObjectId(chapter) },
            ],
          },
        });
      }

      pipeline.push(
        {
          $project: {
            _id: 1,
            status: 1,
            type: 1,
            date: 1,
            title: 1,
            description: 1,
            referral: 1,
            contact: 1,
            amount: 1,
            time: 1,
            meetingLink: 1,
            location: 1,
            supportingDocuments: 1,
            createdAt: 1,
            senderName: "$senderData.name",
            memberName: "$memberData.name",
            referralName: "$referral.name",
          },
        },
        { $sort: { createdAt: -1, _id: 1 } },
        { $skip: skipCount },
        { $limit: Number(limit) }
      );

      const data = await Analytic.aggregate(pipeline);
      const totalCount = await Analytic.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            as: "senderData",
          },
        },
        { $unwind: "$senderData" },
        {
          $lookup: {
            from: "users",
            localField: "member",
            foreignField: "_id",
            as: "memberData",
          },
        },
        { $unwind: "$memberData" },
        ...(chapter
          ? [
              {
                $match: {
                  $or: [
                    {
                      "senderData.chapter": new mongoose.Types.ObjectId(
                        chapter
                      ),
                    },
                    {
                      "memberData.chapter": new mongoose.Types.ObjectId(
                        chapter
                      ),
                    },
                  ],
                },
              },
            ]
          : []),

        { $match: matchStage },
        { $count: "total" },
      ]);

      const count = totalCount.length > 0 ? totalCount[0].total : 0;

      return responseHandler(
        res,
        200,
        "Requests fetched successfully",
        data,
        count
      );
    }

    //* For App API
    const { userId } = req;
    const {
      filter,
      requestType,
      startDate,
      endDate,
      limit = 10,
      pageNo = 1,
    } = req.query;

    const skipCount = 10 * (pageNo - 1);

    let query;
    if (filter === "sent") {
      query = { sender: userId };
    } else if (filter === "received") {
      query = { member: userId };
    } else {
      query = { $or: [{ sender: userId }, { member: userId }] };
    }

    if (requestType) {
      query.type = requestType;
    }

    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);
      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    const totalCount = await Analytic.countDocuments(query);

    const response = await Analytic.find(query)
      .populate("sender", "name image")
      .populate("member", "name image")
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1 });

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
          req.userId == data.sender?._id
            ? data.member?._id
            : data.sender?._id || "";
        username =
          req.userId == data.sender?._id
            ? data.member?.name
            : data.sender?.name || "";
        user_image =
          req.userId == data.sender?._id
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
        meetingLink: data?.meetingLink,
        referral: data?.referral,
      };
    });

    return responseHandler(
      res,
      200,
      "Requests fetched successfully",
      mappedData,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.downloadRequests = async (req, res) => {
  try {
    const { startDate, endDate, chapter, type } = req.query;
    const matchStage = {};

    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);
      matchStage.date = { $gte: start, $lte: end };
    }

    if (type) {
      matchStage.type = type;
    }

    const pipeline = [{ $match: matchStage }];

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "senderData",
        },
      },
      { $unwind: "$senderData" },
      {
        $lookup: {
          from: "users",
          localField: "member",
          foreignField: "_id",
          as: "memberData",
        },
      },
      { $unwind: "$memberData" }
    );

    if (chapter) {
      pipeline.push({
        $match: {
          $or: [
            { "senderData.chapter": new mongoose.Types.ObjectId(chapter) },
            { "memberData.chapter": new mongoose.Types.ObjectId(chapter) },
          ],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          _id: 1,
          status: 1,
          type: 1,
          date: 1,
          title: 1,
          description: 1,
          referral: 1,
          contact: 1,
          amount: 1,
          time: 1,
          meetingLink: 1,
          location: 1,
          supportingDocuments: 1,
          createdAt: 1,
          senderName: "$senderData.name",
          memberName: "$memberData.name",
          referralName: "$referral.name",
        },
      },
      { $sort: { createdAt: -1, _id: 1 } }
    );
    const data = await Analytic.aggregate(pipeline);

    const headers = [
      { header: "Sender", key: "senderName" },
      { header: "Receiver", key: "memberName" },
      { header: "Business Type", key: "type" },
      { header: "Title", key: "title" },
      { header: "Description", key: "description" },
      { header: "Status", key: "status" },
      { header: "Date", key: "date" },
      { header: "Referral", key: "referralName" },
      { header: "Amount", key: "amount" },
    ];

    return responseHandler(res, 200, "Requests fetched successfully", {
      headers,
      body: data,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    if (
      !requestId ||
      !["accepted", "rejected", "meeting_scheduled", "completed"].includes(
        action
      )
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
    )
      .populate("sender", "fcm")
      .populate("member", "fcm");

    if (!updatedRequest) {
      return responseHandler(res, 404, "Request not found.");
    }

    const fcm = [updatedRequest.sender?.fcm, updatedRequest.member?.fcm].filter(
      Boolean
    );

    if (fcm.length > 0) {
      await sendInAppNotification(
        fcm,
        `Your request for ${updatedRequest.type} has been ${action}`,
        `Your request for ${updatedRequest.title} with ${updatedRequest.type} has been ${action}`,
        null,
        "analytics"
      );
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
        select: "name email role chapter image",
      })
      .populate({
        path: "sender",
        select: "name email role chapter image",
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
