const responseHandler = require("../helpers/responseHandler");
const UserAccess = require("../models/userAccessModel");
const validations = require("../validations");
const checkAccess = require("../helpers/checkAccess");


exports.createAccess = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("accessManagement_modify")) {
      return responseHandler(res, 403, "Permission denied!");
    }

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

    return responseHandler(
      res,
      201,
      "Access created successfully!",
      newAccess
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};


exports.getAccess = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("accessManagement_view")) {
      return responseHandler(res, 403, "Permission denied!");
    }

    const accessList = await UserAccess.find();
    if (!accessList.length) {
      return responseHandler(res, 404, "No access entries found!");
    }

    return responseHandler(
      res,
      200,
      "Access entries fetched successfully!",
      accessList
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};


exports.editAccess = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("accessManagement_modify")) {
      return responseHandler(res, 403, "Permission denied!");
    }

    const { Id } = req.params;
    if (!Id) {
      return responseHandler(res, 400, "Access ID is required!");
    }

    const { error } = validations.editAccessSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Validation Error: ${error.message}`);
    }

    const updatedAccess = await UserAccess.findByIdAndUpdate(Id, req.body, {
      new: true,
    });

    if (!updatedAccess) {
      return responseHandler(res, 404, "Access entry not found!");
    }

    return responseHandler(
      res,
      200,
      "Access entry updated successfully!",
      updatedAccess
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
