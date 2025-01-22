const checkAccess = require("../helpers/checkAccess");
const responseHandler = require("../helpers/responseHandler");
const Admin = require("../models/adminModel");
const logActivity = require("../models/logActivityModel");
const { comparePasswords, hashPassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/generateToken");
const validations = require("../validations");

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return responseHandler(res, 400, "Email and password are required");
    }

    const findAdmin = await Admin.findOne({ email });
    if (!findAdmin) {
      return responseHandler(res, 404, "Admin not found");
    }

    const comparePassword = await comparePasswords(
      password,
      findAdmin.password
    );
    if (!comparePassword) {
      return responseHandler(res, 401, "Invalid password");
    }

    const token = generateToken(findAdmin._id, findAdmin.role);

    return responseHandler(res, 200, "Login successfully", token);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createAdmin = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("adminManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { error } = validations.createAdminSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const findAdmin = await Admin.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (findAdmin)
      return responseHandler(
        res,
        409,
        `Admin with this email or phone already exists`
      );

    const hashedPassword = await hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const newAdmin = await Admin.create(req.body);
    status = "success";
    if (newAdmin) {
      return responseHandler(
        res,
        201,
        `New Admin created successfullyy..!`,
        newAdmin
      );
    } else {
      return responseHandler(res, 400, `Admin creation failed...!`);
    }
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "admin",
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

exports.getAdmin = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const id = req.userId;
    if (!id) {
      return responseHandler(res, 400, "Admin ID is required");
    }
    const findAdmin = await Admin.findById(id)
      .select("-password")
      .populate("role", "permissions roleName")
      .lean();
    if (!findAdmin) {
      return responseHandler(res, 404, "Admin not found");
    }
    status = "success";
    return responseHandler(res, 200, "Admin found", findAdmin);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "admin",
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

exports.getAllAdmins = async (req, res) => {
  let Status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    console.log(req.roleId);
    if (!check || !check.includes("adminManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { pageNo = 1, status, limit = 10 } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {
      _id: { $nin: ["677e0e68b53dc8a4f2675f00", req.userId] },
    };
    const totalCount = await Admin.countDocuments(filter);
    const data = await Admin.find(filter)
      .skip(skipCount)
      .limit(limit)
      .populate("role")
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    Status = "success";
    return responseHandler(
      res,
      200,
      `Admins found successfullyy..!`,
      data,
      totalCount
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "admin",
      description: "Get all admins",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers.host,
      agent: req.headers["user-agent"],
      status: Status,
      errorMessage,
    });
  }
};

exports.fetchAdmin = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("adminManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Admin ID is required");
    }
    const findAdmin = await Admin.findById(id)
      .select("-password")
      .populate("role", "permissions")
      .lean();

    status = "success";

    if (!findAdmin) {
      return responseHandler(res, 404, "Admin not found");
    }
    return responseHandler(res, 200, "Admin found", findAdmin);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "admin",
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

exports.updateAdmin = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("adminManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { error } = validations.editAdminSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const adminId = req.params.id;
    const findAdmin = await Admin.findById(adminId);
    if (!findAdmin) {
      return responseHandler(res, 404, `Admin not found`);
    }

    if (req.body.password) {
      req.body.password = await hashPassword(req.body.password);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, req.body, {
      new: true,
      runValidators: true,
    });

    status = "success";
    if (updatedAdmin) {
      return responseHandler(
        res,
        200,
        "Admin updated successfully",
        updatedAdmin
      );
    } else {
      return responseHandler(res, 400, "Admin update failed");
    }
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "admin",
      description: "Admin update",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers.host,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("adminManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const adminId = req.params.id;
    const findAdmin = await Admin.findById(adminId);
    if (!findAdmin) {
      return responseHandler(res, 404, `Admin not found`);
    }

    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    status = "success";
    if (deletedAdmin) {
      return responseHandler(res, 200, "Admin deleted successfully");
    } else {
      return responseHandler(res, 400, "Admin deletion failed");
    }
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "admin",
      description: "Admin deletion",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers.host,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.fetchLogActivity = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, status, method } = req.query;

    const filter = {};

    if (date) {
      filter.createdAt = date;
    }

    if (status) {
      filter.status = status;
    }

    if (method) {
      filter.httpMethod = method;
    }

    const skipCount = 10 * (page - 1);

    const logs = await logActivity
      .find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 });

    const totalLogs = await logActivity.countDocuments(filter);

    return responseHandler(
      res,
      200,
      "Log activities fetched successfully",
      logs,
      totalLogs
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.fetchLogActivityById = async (req, res) => {
  try {
    const logActivityId = req.params.id;

    const log = await logActivity.findById(logActivityId);

    if (!log) {
      return responseHandler(res, 404, "Log activity not found");
    }

    return responseHandler(res, 200, "Log activity fetched successfully", log);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
