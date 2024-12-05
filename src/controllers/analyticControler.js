const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const Analytic = require("../models/analyticModel");

exports.sendRequest = async (req, res) => {
  try {
    const { error } = validations.createAnalyticSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    req.body.sender = req.userId;

    const analytic = await Analytic.create(req.body);
    return responseHandler(res, 201, "Request created successfully", analytic);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const { filter } = req.query;

    let query;

    if (filter === "sent") {
      query = { sender: userId };
    } else if (filter === "received") {
      query = { member: userId };
    } else {
      query = { $or: [{ sender: userId }, { member: userId }] };
    }

    const response = await Analytic.find(query)
      .populate("sender", "name image")
      .populate("member", "name image");

    console.log(filter);

    const mappedData = response.map((data) => {
      return {
        username: filter === "sent" ? data.sender.name : data.member.name,
        user_image: filter === "sent" ? data.sender.image : data.member.image,
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
      response
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
