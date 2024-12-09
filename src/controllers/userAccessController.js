const responseHandler = require("../helpers/responseHandler");
const UserAccess = require("../models/userAccessModel");
const validations = require("../validations");
const checkAccess = require("../helpers/checkAccess");
const logActivity = require("../models/logActivityModel");



exports.createAccess = async (req, res) => {
  let Status = "failure";
  let errorMessage = null;
  try {
    

    const { error } = validations.createAccessSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Validation Error: ${error.message}`);
    }

    const newAccess = await UserAccess.create(req.body);
    if (!newAccess) {
      return responseHandler(res, 400, "Access creation failed!");
    }
    Status = "success";

    return responseHandler(res, 201, "Access created successfully!", newAccess);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "userAccess",
      description: "Admin creation",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers.host,
      agent: req.headers["user-agent"],
      status:Status,
      errorMessage,
    });
  }
};

exports.getAccess = async (req, res) => {
  let Status = "failure";
  let errorMessage = null;
  try {
    

    const accessList = await UserAccess.find();
    if (!accessList.length) {
      return responseHandler(res, 404, "No access entries found!");
    }
    Status = "success";
    return responseHandler(
      res,
      200,
      "Access entries fetched successfully!",
      accessList
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "userAccess",
      description: "Admin creation",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers.host,
      agent: req.headers["user-agent"],
      status:Status,
      errorMessage,
    });
  }
};

exports.editAccess = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Access ID is required!");
    }

    const { error } = validations.editAccessSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Validation Error: ${error.message}`);
    }

    const updatedAccess = await UserAccess.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedAccess) {
      return responseHandler(res, 404, "Access entry not found!");
    }
    status = "success";
    return responseHandler(
      res,
      200,
      "Access entry updated successfully!",
      updatedAccess
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "userAccess",
      description: "Admin creation",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers.host,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};
