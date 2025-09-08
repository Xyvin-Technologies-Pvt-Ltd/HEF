const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const Analytic = require("../models/analyticModel")
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
    if (req.body.onBehalf) {
      if (!req.body.sender) {
        return responseHandler(res, 400, "Sender ID is required for on-behalf request");
      }
      req.body.member = req.userId;  
    } else {
      if (req.role !== "admin") {
        req.body.sender = req.userId
      }
    }
    const user = await User.findById(req.body.member);
    const analytic = await Analytic.create(req.body);
    if (analytic) {
      await sendInAppNotification(
        user.fcm,
        "You have a new request",
        "You have a new request",
        null,
        "analytic",
        analytic._id.toString()
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
        matchStage.$or = [{ sender:  new mongoose.Types.ObjectId(user) }, { member:  new mongoose.Types.ObjectId(user) }];
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
        const types = ["Business", "Referral", "One v One Meeting"];
        const totalsArray = [];

        for (const t of types) {
         const sent = await Analytic.countDocuments({
         ...matchStage,
         type: t,
         sender: { $exists: true },
          });

        const received = await Analytic.countDocuments({
        ...matchStage,
        type: t,
        member: { $exists: true },
        onBehalf: true,
         });

        totalsArray.push({
        type: t,
        total: sent + received,
        sent,
        received,
         });
     }
      return responseHandler(res, 200, "Requests fetched successfully", {
      totals: totalsArray,
      data,
      count,  
      }
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
      } 
      else if (filter === "received") 
        {
          query = { member: userId, onBehalf: true};
        } 
      else 
        {
      query = { $or: [{ sender: userId }, 
                  { member: userId, onBehalf: true}] };
         }

      if (requestType) 
      {
      query.type = requestType;
    }

    if (startDate && endDate) 
      {
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
         let user_id = "";
         let username = "";
         let user_image = "";

  // Sent activities
      if (filter === "sent") 
      {
      user_id = data.member?._id?.toString() || "";
      username = data.member?.name || data.memberName || "";
      user_image = data.member?.image || "";
      }
  // Received activities
      else if (filter === "received") 
      {
      user_id = data.sender?._id?.toString() || "";
      username = data.sender?.name || data.senderName || "";
      user_image = data.sender?.image || "";
      }
  // All activities
     else 
      {
      const isSender = req.userId === data.sender?._id?.toString();
     if (isSender) 
      {
      user_id = data.member?._id?.toString() || "";
      username = data.member?.name || data.memberName || "";
      user_image = data.member?.image || "";
      } 
      else 
      {
      user_id = data.sender?._id?.toString() || "";
      username = data.sender?.name || data.senderName || "";
      user_image = data.sender?.image || "";
    }
  }

  return {
    _id: data._id,
    user_id,
    username,
    user_image,
    title: data.title,
    description: data.description,
    type: data.type,
    status: data.status,
    amount: data.amount,
    date: data.date,
    time: data.time,
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
  } 
  catch (error) 
  {
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
}

exports.getHighestPerformer = async (req, res) => {
  try {
    const { chapter, zone, district, state, type, filter } = req.query;

    // Base filter
    let match = {};
    if (chapter) match.chapter = chapter;
    if (zone) match.zone = zone;
    if (district) match.district = district;
    if (state) match.state = state;
    if (type && type !== "All") match.type = type;

    //  Sent / Received / All filter
    let performerMatch = { ...match };
    if (filter === "sent")
       {
      performerMatch.sender = { $exists: true };
       } 
    else if (filter === "received") 
      {
      performerMatch.member = { $exists: true };
      performerMatch.onBehalf = true;
      } 
      else
      {
      performerMatch.$or = [
        { sender: { $exists: true } },
        { member: { $exists: true }, onBehalf: true }
      ];
    }

    //  Counts for cards
    const sentCount = await Analytic.countDocuments({ ...match, sender: { $exists: true } });
    const receivedCount = await Analytic.countDocuments({ ...match, member: { $exists: true }, onBehalf: true });
    const totalCount = sentCount + receivedCount;

    //  Aggregate top performer
    const performersAggregation = await Analytic.aggregate([
      { $match: performerMatch },
      {
        $project: {
          user: { $cond: [{ $eq: ["$sender", null] }, "$member", "$sender"] },
          amount: 1,
          type: 1,
          title: 1,
          description: 1,
          status: 1,
          date: 1,
          time: 1,
          meetingLink: 1,
          referral: 1,
        }
      },
      { $group: { _id: "$user", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" } },
      { $unwind: "$userInfo" },
      { $sort: { totalAmount: -1 } },
      ]
    );

    const topPerformerRaw = performersAggregation[0] || null;
    const remainingPerformersRaw = performersAggregation.slice(1);

    // Map to frontend compatible format
    const mapPerformer = (perf) => ({
      _id: perf._id.toString(),
      user_id: perf._id.toString(),
      username: perf.userInfo.name,
      user_image: perf.userInfo.image || "",
      totalAmount: perf.totalAmount,
      count: perf.count,
    }
  );

    const topPerformer = topPerformerRaw ? mapPerformer(topPerformerRaw) : null;
    const remainingPerformers = remainingPerformersRaw.map(mapPerformer);

    //  Sent / Received performers separately
    const mapAgg = (arr) => arr.map((p) => ({
      _id: p._id.toString(),
      user_id: p._id.toString(),
      username: p.userInfo.name,
      user_image: p.userInfo.image || "",
      totalAmount: p.totalAmount,
      count: p.count,
    }
  )
);

    const sentPerformers = mapAgg(await Analytic.aggregate([
      { $match: { ...match, sender: { $exists: true } } },
      { $group: { _id: "$sender", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" } },
      { $unwind: "$userInfo" },
      { $sort: { totalAmount: -1 } },
    ]));

    const receivedPerformers = mapAgg(await Analytic.aggregate([
      { $match: { ...match, member: { $exists: true }, onBehalf: true } },
      { $group: { _id: "$member", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" } },
      { $unwind: "$userInfo" },
      { $sort: { totalAmount: -1 } },
    ]));

    //  Zone Analytics
    const zoneAnalytics = await Analytic.aggregate([
      { $match: match },
      { $group: { _id: "$zone", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } }
    ]).then(zones => zones.map(z => ({
      name: z._id || "N/A",
      totalAmount: z.totalAmount,
      count: z.count
    })));

    // Send response
    res.status(200).json({
      status: "success",
      message: "Analytics fetched successfully",
      data: {
        cards: {
          total: totalCount,
          sent: sentCount,
          received: receivedCount,
          topPerformer,
        },
        topPerformer,
        remainingPerformers,
        sentPerformers,
        receivedPerformers,
        zoneAnalytics,
      },
    });
  } catch (err) {
    console.error("Error in getHighestPerformer:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
