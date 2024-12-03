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

exports.viewAllRequests = async (req, res) => {
  try {
    const analytics = await Analytic.find();

    return responseHandler(
      res,
      200,
      "Requests fetched successfully",
      analytics
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
