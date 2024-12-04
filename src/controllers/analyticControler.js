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

    const requests = await Analytic.find(query)
      .populate("sender", "name image")
      .populate("member", "name image"); 

    return responseHandler(
      res,
      200,
      "Requests fetched successfully",
      requests
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
