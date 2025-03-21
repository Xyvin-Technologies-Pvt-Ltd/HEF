const checkAccess = require("../helpers/checkAccess");
const responseHandler = require("../helpers/responseHandler");
const Admin = require("../models/adminModel");
const Analytic = require("../models/analyticModel");
const Chapter = require("../models/chapterModel");
const District = require("../models/districtModel");
const Event = require("../models/eventModel");
const logActivity = require("../models/logActivityModel");
const News = require("../models/newsModel");
const Notification = require("../models/notificationModel");
const Promotion = require("../models/promotionModel");
const State = require("../models/stateModel");
const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");
const Zone = require("../models/zoneModel");
const { comparePasswords, hashPassword } = require("../utils/bcrypt");
const { generateDuplicateExcel } = require("../utils/generateDuplicateExcel");
const { generateRandomPassword } = require("../utils/generateRandomPassword");
const { generateToken } = require("../utils/generateToken");
const { generateUniqueMemberId } = require("../utils/generateUniqueMemberId");
const sendMail = require("../utils/sendMail");
const validations = require("../validations");
const moment = require("moment-timezone");

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

    const generatedPassword = generateRandomPassword();

    const hashedPassword = await hashPassword(generatedPassword);
    req.body.password = hashedPassword;

    const data = {
      to: req.body.email,
      subject: "Admin Registration Notification",
      text: `Hello, ${req.body.name}. 
        You have been registered as an admin on the platform. 
        Please use the following credentials to log in: Email: ${req.body.email} Password: ${generatedPassword} 
        Thank you for joining us! 
        Best regards, The Admin Team`,
    };

    await sendMail(data);

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
      host: req.headers["x-forwarded-for"] || req.ip,
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
      host: req.headers["x-forwarded-for"] || req.ip,
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
      host: req.headers["x-forwarded-for"] || req.ip,
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
      host: req.headers["x-forwarded-for"] || req.ip,
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
      host: req.headers["x-forwarded-for"] || req.ip,
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
      host: req.headers["x-forwarded-for"] || req.ip,
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

exports.fetchDashboard = async (req, res) => {
  try {
    const [
      memberShipCount,
      businessCount,
      oneVOneMeetingCount,
      referralsCount,
      states,
      zones,
      districts,
      chapters,
      eventCount,
      newsCount,
      promotionCount,
      notificationCount,
      topPerformers,
      totalUsers,
      activeUsers,
      inactiveUsers,
      installedUsers,
      graph,
    ] = await Promise.all([
      Subscription.countDocuments({ status: "active" }),
      Analytic.countDocuments({
        type: "Business",
      }),
      Analytic.countDocuments({
        type: "One v One Meeting",
      }),
      Analytic.countDocuments({
        type: "Referral",
      }),
      State.find({}, "admins"),
      Zone.find({}, "admins"),
      District.find({}, "admins"),
      Chapter.find({}, "admins"),
      Event.countDocuments(),
      News.countDocuments(),
      Promotion.countDocuments(),
      Notification.countDocuments(),
      Analytic.aggregate([
        {
          $match: { status: "accepted" },
        },
        {
          $group: {
            _id: null,
            memberIds: { $push: "$member" },
            senderIds: { $push: "$sender" },
            referralIds: { $push: "$referral" },
          },
        },
        {
          $project: {
            allUsers: {
              $concatArrays: ["$memberIds", "$senderIds", "$referralIds"],
            },
          },
        },
        { $unwind: "$allUsers" },
        {
          $group: {
            _id: "$allUsers",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 4,
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            from: "chapters",
            localField: "user.chapter",
            foreignField: "_id",
            as: "chapter",
          },
        },
        {
          $unwind: { path: "$chapter", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "districts",
            localField: "chapter.districtId",
            foreignField: "_id",
            as: "district",
          },
        },
        {
          $unwind: { path: "$district", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "zones",
            localField: "district.zoneId",
            foreignField: "_id",
            as: "zone",
          },
        },
        {
          $unwind: { path: "$zone", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "states",
            localField: "zone.stateId",
            foreignField: "_id",
            as: "state",
          },
        },
        {
          $unwind: { path: "$state", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            count: 1,
            name: "$user.name",
            email: "$user.email",
            chapter: "$chapter.name",
            district: "$district.name",
            zone: "$zone.name",
            state: "$state.name",
          },
        },
      ]),
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "inactive" }),
      User.countDocuments({
        $and: [{ fcm: { $ne: null } }, { fcm: { $ne: "" } }],
      }),
      Analytic.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "member",
            foreignField: "_id",
            as: "memberData",
          },
        },
        { $unwind: "$memberData" },

        {
          $lookup: {
            from: "chapters",
            localField: "memberData.chapter",
            foreignField: "_id",
            as: "chapterData",
          },
        },
        { $unwind: "$chapterData" },

        {
          $lookup: {
            from: "districts",
            localField: "chapterData.districtId",
            foreignField: "_id",
            as: "districtData",
          },
        },
        { $unwind: "$districtData" },

        {
          $lookup: {
            from: "zones",
            localField: "districtData.zoneId",
            foreignField: "_id",
            as: "zoneData",
          },
        },
        { $unwind: "$zoneData" },

        {
          $group: {
            _id: "$zoneData.name",
            count: { $sum: 1 },
            totalAmount: {
              $sum: { $toDouble: "$amount" },
            },
          },
        },

        {
          $project: {
            _id: 0,
            name: "$_id",
            count: 1,
            value: "$totalAmount",
          },
        },
      ]),
    ]);

    const calculateAdmins = (data) =>
      data.reduce((sum, item) => sum + item.admins.length, 0);

    return responseHandler(res, 200, "Dashboard fetched successfully", {
      memberShipCount,
      memberShipRevenue: memberShipCount * 1000,
      businessCount,
      oneVOneMeetingCount,
      referralsCount,
      statePST: calculateAdmins(states),
      zonePST: calculateAdmins(zones),
      districtPST: calculateAdmins(districts),
      chapterPST: calculateAdmins(chapters),
      eventCount,
      newsCount,
      promotionCount,
      notificationCount,
      topPerformers,
      totalUsers,
      activeUsers,
      inactiveUsers,
      installedUsers,
      graph,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.bulkCreateUser = async (req, res) => {
  try {
    const { error } = validations.bulkCreateUserSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return responseHandler(
        res,
        400,
        `Validation Error: ${error.details
          .map((err) => err.message)
          .join(", ")}`
      );
    }

    let users = req.body;

    const existingUsers = await User.find({
      phone: { $in: users.map((user) => user.phone) },
      status: { $ne: "deleted" },
    });

    if (existingUsers.length > 0) {
      const duplicatePhones = existingUsers.map((user) => user.phone);
      const base64Excel = await generateDuplicateExcel(duplicatePhones);
      return responseHandler(
        res,
        400,
        "Some users already exist with the same phone number.",
        { duplicates: duplicatePhones, excelFile: base64Excel }
      );
    }

    let generatedMemberIds = new Set();

    for (let user of users) {
      const chapter = await Chapter.findById(user.chapter);
      if (!chapter) {
        return responseHandler(res, 400, `Invalid chapter ID: ${user.chapter}`);
      }

      let uniqueMemberId = await generateUniqueMemberId(
        user.name,
        chapter.shortCode,
        generatedMemberIds
      );
      user.memberId = uniqueMemberId;
      generatedMemberIds.add(uniqueMemberId);

      if (user.businessTags && typeof user.businessTags === "string") {
        user.businessTags = user.businessTags
          .split(",")
          .map((tag) => tag.trim().toLowerCase());
      }
    }

    const createdUsers = await User.insertMany(users);

    return responseHandler(
      res,
      201,
      "Users created successfully",
      createdUsers
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.downloadUser = async (req, res) => {
  try {
    const { status, installed } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (installed == "false") {
      filter.fcm = { $in: [null, ""] };
    } else if (installed) {
      filter.fcm = {
        $nin: [null, ""],
      };
    }
    const users = await User.find(filter).populate("chapter", "name").lean();
    if (users.length === 0) {
      return responseHandler(res, 404, "No users found");
    }
    const headers = [
      { header: "Member ID", key: "ID" },
      { header: "Name", key: "Name" },
      { header: "Phone", key: "Phone" },
      { header: "Email", key: "Email" },
      { header: "Chapter Name", key: "ChapterName" },
      { header: "Date of Joining", key: "DateOfJoining" },
      { header: "Address", key: "Address" },
      { header: "Business Catogary", key: "BusinessCatogary" },
      { header: "Business Sub Catogary", key: "BusinessSubCatogary" },
      { header: "Subscription", key: "Subscription" },
    ];

    const mappedData = users.map((item) => {
      return {
        ID: item.memberId,
        Name: item.name,
        Phone: item.phone,
        Email: item.email,
        ChapterName: item.chapter?.name,
        DateOfJoining: moment(item.dateOfJoining).format("DD-MM-YYYY"),
        Address: item.address,
        BusinessCatogary: item.businessCatogary,
        BusinessSubCatogary: item.businessSubCatogary,
        Subscription: item.subscription,
      };
    });

    const data = {
      headers,
      body: mappedData,
    };
    return responseHandler(res, 200, "Users found successfully", data);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
