const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const checkAccess = require("../helpers/checkAccess");
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/userModel");
const { generateOTP } = require("../utils/generateOTP");
const { generateToken } = require("../utils/generateToken");
const validations = require("../validations");
const Setting = require("../models/settingsModel");
const Feeds = require("../models/feedsModel");
const Products = require("../models/productModel");
const { generateUniqueMemberId } = require("../utils/generateUniqueMemberId");
const Chapter = require("../models/chapterModel");
const District = require("../models/districtModel");
const Review = require("../models/reviewModel");
const { isUserAdmin } = require("../utils/adminCheck");
const logActivity = require("../models/logActivityModel");
const Analytic = require("../models/analyticModel");
const mongoose = require("mongoose");

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return responseHandler(res, 400, "Phone number is required");
    }
    const checkExist = await User.findOne({ phone });
    const otp = generateOTP(5);
    if (checkExist) {
      checkExist.otp = otp;
      checkExist.save();
      return responseHandler(res, 200, "OTP sent successfully", otp);
    }

    req.body.otp = otp;
    const user = await User.create(req.body);
    if (user) return responseHandler(res, 200, "OTP sent successfully", otp);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    if (!otp) {
      return responseHandler(res, 400, "OTP is required");
    }
    if (!phone) {
      return responseHandler(res, 400, "Phone number is required");
    }
    const user = await User.findOne({ phone });
    if (!user) {
      return responseHandler(res, 404, "User not found");
    }
    if (user.otp !== otp) {
      return responseHandler(res, 400, "Invalid OTP");
    }
    user.otp = null;
    await user.save();
    const token = generateToken(user._id);

    return responseHandler(res, 200, "User verified successfully", {
      token: token,
      userId: user._id,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.checkUser = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return responseHandler(res, 400, "Phone number is required");
    }
    const checkExist = await User.findOne({ phone });
    if (checkExist) {
      return responseHandler(res, 200, "User already exists");
    }
    return responseHandler(res, 400, "User does not exist");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createNewUser = async (req, res) => {
  try {
    const { error } = validations.createUserSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const checkExist = await User.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });

    if (checkExist) {
      return responseHandler(
        res,
        409,
        `User with this email or phone already exists`
      );
    }

    const newUser = await User.create(req.body);

    if (newUser)
      return responseHandler(
        res,
        201,
        `New User created successfull..!`,
        newUser
      );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createUser = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("memberManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { error } = validations.createUserSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const checkExist = await User.findOne({
      $or: [{ phone: req.body.phone }],
    });

    if (checkExist) {
      return responseHandler(
        res,
        409,
        `User with this email or phone already exists`
      );
    }
    const chapter = await Chapter.findById(req.body.chapter);
    const uniqueMemberId = await generateUniqueMemberId(
      req.body.name,
      chapter.shortCode
    );

    req.body.memberId = uniqueMemberId;
    const newUser = await User.create(req.body);

    if (newUser)
      return responseHandler(
        res,
        201,
        `New User created successfull..!`,
        newUser
      );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.editUser = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("memberManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { error } = validations.editUserSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const findUser = await User.findById(id);
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }

    const editUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!editUser) {
      return responseHandler(res, 400, `User update failed...!`);
    }
    status = "success";
    return responseHandler(res, 200, `User updated successfully`, editUser);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "user",
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

exports.getUser = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("memberManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const findUser = await User.findById(id)
      .populate({
        path: "chapter",
        select: "name",
        populate: {
          path: "districtId",
          select: "name",
          populate: {
            path: "zoneId",
            select: "name",
            populate: {
              path: "stateId",
              select: "name",
            },
          },
        },
      })
      .lean();

    const adminDetails = await isUserAdmin(id);

    const level = `${findUser?.chapter?.districtId?.zoneId?.stateId?.name} State ${findUser?.chapter?.districtId?.zoneId?.name} Zone ${findUser?.chapter?.districtId?.name} District ${findUser?.chapter?.name} Chapter`;

    const state = {
      _id: findUser?.chapter?.districtId?.zoneId?.stateId?._id,
      name: findUser?.chapter?.districtId?.zoneId?.stateId?.name,
    };

    const zone = {
      _id: findUser?.chapter?.districtId?.zoneId?._id,
      name: findUser?.chapter?.districtId?.zoneId?.name,
    };

    const district = {
      _id: findUser?.chapter?.districtId?._id,
      name: findUser?.chapter?.districtId?.name,
    };

    const chapter = {
      _id: findUser?.chapter?._id,
      name: findUser?.chapter?.name,
    };

    const mappedData = {
      ...findUser,
      level,
      state,
      zone,
      district,
      chapter,
      isAdmin: adminDetails ? true : false,
      adminType: adminDetails?.type || null,
      levelName: adminDetails?.name || null,
    };

    status = "success";
    if (findUser) {
      return responseHandler(res, 200, `User found successfull..!`, mappedData);
    }
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "user",
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

exports.getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const findUser = await User.findById(id).populate({
      path: "chapter",
      select: "name",
      populate: {
        path: "districtId",
        select: "name",
        populate: {
          path: "zoneId",
          select: "name",
          populate: {
            path: "stateId",
            select: "name",
          },
        },
      },
    });

    const adminDetails = await isUserAdmin(id);

    const level = `${findUser?.chapter?.districtId?.zoneId?.stateId?.name} State ${findUser?.chapter?.districtId?.zoneId?.name} Zone ${findUser?.chapter?.districtId?.name} District ${findUser?.chapter?.name} Chapter`;

    const mappedData = {
      ...findUser._doc,
      level,
      isAdmin: adminDetails ? true : false,
      adminType: adminDetails?.type || null,
      levelName: adminDetails?.name || null,
      levelId: adminDetails?.id,
    };

    if (findUser) {
      return responseHandler(res, 200, `User found successfull..!`, mappedData);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteUser = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("memberManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const findUser = await User.findById(id);
    status = "success";
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }

    const deleteUser = await User.findByIdAndUpdate(
      id,
      { status: "deleted" },
      {
        new: true,
      }
    );

    status = "success";
    if (deleteUser) {
      return responseHandler(res, 200, `User deleted successfully..!`);
    }
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "user",
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

exports.updateUser = async (req, res) => {
  try {
    const { error } = validations.updateUserSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const formattedErrors = error.details.map((err) => {
        if (err.path[0] === "company" && typeof err.path[1] === "number") {
          return `Error in company at index ${err.path[1] + 1}: ${err.message}`;
        }
        return err.message;
      });

      return responseHandler(
        res,
        400,
        `Invalid input: ${formattedErrors.join("; ")}`
      );
    }

    const id = req.userId;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const findUser = await User.findById(id);
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }

    const editUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!editUser) {
      return responseHandler(res, 400, `User update failed...!`);
    }
    return responseHandler(res, 200, `User updated successfully`, editUser);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllUsers = async (req, res) => {
  let Status = "failure";
  let errorMessage = null;

  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("memberManagement_view")) {
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
      search,
      name = "",
      membershipId = "",
      installed,
      chapter,
      from,
      to,
    } = req.query;
    const skipCount = limit * (pageNo - 1);
    const filter = {};
    if (search) {
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      filter.$or = [
        { status: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { name: { $regex: escapedSearch, $options: "i" } },
        { memberId: { $regex: escapedSearch, $options: "i" } },
        { "chapter.name": { $regex: escapedSearch, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    if (name && name !== "") {
      filter.name = { $regex: name, $options: "i" };
    }

    if (membershipId && membershipId !== "") {
      filter.memberId = { $regex: membershipId, $options: "i" };
    }

    if (chapter && chapter !== "") {
      filter.chapter = new mongoose.Types.ObjectId(chapter);
    }

    if (installed == "false") {
      filter.fcm = { $in: [null, ""] };
    } else if (installed) {
      filter.fcm = {
        $nin: [null, ""],
      };
    }

    if (from && to) {
      filter.dateOfJoining = {
        $gte: new Date(`${from}T00:00:00.000Z`),
        $lte: new Date(`${to}T23:59:59.999Z`),
      };
    }

    const totalCount = await User.countDocuments(filter);
    const data = await User.find(filter)
      .populate("chapter")
      .skip(skipCount)
      .limit(limit)
      .sort({ name: 1 })
      .lean();

    const mappedData = await Promise.all(
      data.map(async (user) => {
        const adminDetails = await isUserAdmin(user._id);
        return {
          ...user,
          name: user.name || "",
          chapterName: user.chapter?.name || "",
          isAdmin: adminDetails ? true : false,
          adminType: adminDetails?.type || null,
          levelName: adminDetails?.name || null,
        };
      })
    );
    Status = "success";
    return responseHandler(
      res,
      200,
      `Users found successfully..!`,
      mappedData,
      totalCount
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "user",
      description: "Get admin details",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status: Status,
      errorMessage,
    });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10, search, district, tags } = req.query;
    const skipCount = limit * (pageNo - 1);

    const currentUser = await User.findById(req.userId).select("blockedUsers");
    const blockedUsersList = currentUser?.blockedUsers || [];

    const matchQuery = {
      status: { $in: ["active", "awaiting_payment"] },
      _id: {
        $ne: new mongoose.Types.ObjectId(req.userId),
        $nin: blockedUsersList,
      },
    };

    const searchConditions = [];

    if (search) {
      searchConditions.push({ name: { $regex: `^${search}`, $options: "i" } });
    }

    if (tags) {
      const tagSearchQueries = tags.split(",").map((tag) => ({
        businessTags: { $regex: `^${tag.trim()}`, $options: "i" },
      }));
      searchConditions.push(...tagSearchQueries);
    }

    if (searchConditions.length > 0) {
      matchQuery.$or = searchConditions;
    }

    const districtMatch = district
      ? { "chapter.districtId": new mongoose.Types.ObjectId(district) }
      : {};

    const result = await User.aggregate([
      {
        $lookup: {
          from: "chapters",
          localField: "chapter",
          foreignField: "_id",
          as: "chapter",
        },
      },
      { $unwind: { path: "$chapter", preserveNullAndEmptyArrays: true } },
      ...(district ? [{ $match: districtMatch }] : []),
      {
        $lookup: {
          from: "districts",
          localField: "chapter.districtId",
          foreignField: "_id",
          as: "district",
        },
      },
      { $unwind: { path: "$district", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "zones",
          localField: "district.zoneId",
          foreignField: "_id",
          as: "zone",
        },
      },
      { $unwind: { path: "$zone", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "states",
          localField: "zone.stateId",
          foreignField: "_id",
          as: "state",
        },
      },
      { $unwind: { path: "$state", preserveNullAndEmptyArrays: true } },
      { $match: matchQuery },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          users: [
            { $sort: { name: 1 } },
            { $skip: skipCount },
            { $limit: parseInt(limit) },
            {
              $project: {
                _id: 1,
                name: 1,
                status: 1,
                memberId: 1,
                businessTags: 1,
                level: {
                  $concat: [
                    { $ifNull: ["$state.name", ""] },
                    { $cond: [{ $ne: ["$state.name", null] }, " State ", ""] },
                    { $ifNull: ["$zone.name", ""] },
                    { $cond: [{ $ne: ["$zone.name", null] }, " Zone ", ""] },
                    { $ifNull: ["$district.name", ""] },
                    {
                      $cond: [
                        { $ne: ["$district.name", null] },
                        " District ",
                        "",
                      ],
                    },
                    { $ifNull: ["$chapter.name", ""] },
                    {
                      $cond: [{ $ne: ["$chapter.name", null] }, " Chapter", ""],
                    },
                  ],
                },
                state: { _id: "$state._id", name: "$state.name" },
                zone: { _id: "$zone._id", name: "$zone.name" },
                district: { _id: "$district._id", name: "$district.name" },
                chapter: {
                  _id: "$chapter._id",
                  name: "$chapter.name",
                  shortCode: "$chapter.shortCode",
                },
                image: 1,
                email: 1,
                phone: 1,
                secondaryPhone: 1,
                bio: 1,
                address: 1,
                company: 1,
                dateOfJoining: 1,
                createdAt: 1,
                updatedAt: 1,
                websites: 1,
                awards: 1,
                social: 1,
                file: 1,
                videos: 1,
                certificates: 1,
              },
            },
          ],
        },
      },
    ]);

    const totalCount =
      result[0].metadata.length > 0 ? result[0].metadata[0].total : 0;
    const users = result[0].users;

    return responseHandler(
      res,
      200,
      "Users found successfully!",
      users,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
exports.fetchUser = async (req, res) => {
  try {
    const id = req.userId;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const findUser = await User.findById(id);

    if (findUser) {
      const fieldsToCheck = [
        findUser.name,
        findUser.role,
        findUser.image,
        findUser.email,
        findUser.phone,
        findUser.bio,
        findUser.address,
        findUser.company?.name,
        findUser.company?.designation,
        findUser.company?.phone,
        findUser.company?.address,
      ];

      const filledFields = fieldsToCheck.filter((field) => field).length;
      const totalFields = fieldsToCheck.length;
      const profileCompletionPercentage = Math.round(
        (filledFields / totalFields) * 100
      );

      findUser.profileCompletion = `${profileCompletionPercentage}%`;

      const feedsCount = await Feeds.countDocuments({ author: id });

      const productCount = await Products.countDocuments({ seller: id });

      const adminDetails = await isUserAdmin(id);

      const userResponse = {
        ...findUser._doc,
        profileCompletion: findUser.profileCompletion,
        feedsCount,
        productCount,
        isAdmin: adminDetails ? true : false,
        adminType: adminDetails?.type || null,
        levelName: adminDetails?.name || null,
      };

      return responseHandler(
        res,
        200,
        "User found successfully..!",
        userResponse
      );
    } else {
      return responseHandler(res, 404, "User not found");
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const id = req.body.clientToken;
    const { fcm } = req.body;
    if (!id) {
      return responseHandler(res, 400, "Client Token is required");
    }
    let user;
    admin
      .auth()
      .verifyIdToken(id)
      .then(async (decodedToken) => {
        user = await User.findOne({ phone: decodedToken.phone_number });
        if (!user) {
          return responseHandler(
            res,
            400,
            "User with this phone number does not exist"
          );
        } else if (user.uid && user.uid !== null) {
          user.fcm = fcm;
          user.uid = decodedToken.uid;
          user.save();
          const token = generateToken(user._id);
          return responseHandler(res, 200, "User logged in successfully", {
            token: token,
            userId: user._id,
          });
        } else {
          user.uid = decodedToken.uid;
          user.fcm = fcm;
          user.save();
          const token = generateToken(user._id);
          return responseHandler(res, 200, "User logged in successfully", {
            token: token,
            userId: user._id,
          });
        }
      });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getVersion = async (req, res) => {
  try {
    const settings = await Setting.findOne();

    return responseHandler(
      res,
      200,
      "App version fetched successfully",
      settings
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getApprovals = async (req, res) => {
  try {
    const { userId } = req;
    const findUser = await User.findById(userId);
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }

    if (findUser.role === "member") {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = { status: "inactive" };
    const totalCount = await User.countDocuments(filter);
    const data = await User.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();
    return responseHandler(
      res,
      200,
      `Approvals found successfull..!`,
      data,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { userId } = req;
    const fetchUser = await User.findById(userId);
    if (!fetchUser) {
      return responseHandler(res, 404, "User not found");
    }

    if (fetchUser.role === "member") {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }
    const findUser = await User.findById(id);
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }
    const editUser = await User.findByIdAndUpdate(id, req.body, { new: true });

    let message;

    if (status === "awaiting_payment") {
      message = {
        notification: {
          title: `HEF Membership has been approved`,
          body: `Your membership for HEF has been approved successfully. Please complete the payment process to continue.`,
        },
        token: findUser.fcm,
      };
    } else {
      message = {
        notification: {
          title: `HEF Membership has been rejected`,
          body: `Your membership for HEF has been rejected, because of ${req.body.reason}.`,
        },
        token: findUser.fcm,
      };
    }

    getMessaging()
      .send(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });

    if (!editUser) {
      return responseHandler(res, 400, `User update failed...!`);
    }
    return responseHandler(res, 200, `User ${status} successfully`);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10, status } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {};
    if (status) {
      filter.status = status;
    }
    const totalCount = await User.countDocuments(filter);
    const data = await User.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    return responseHandler(
      res,
      200,
      `Users found successfull..!`,
      data,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const findUser = await User.findById(req.userId);
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }

    if (findUser.blockedUsers.includes(id)) {
      return responseHandler(res, 400, "User is already blocked");
    }

    findUser.blockedUsers.push(id);
    const editUser = await findUser.save();
    if (!editUser) {
      return responseHandler(res, 400, `User block failed...!`);
    }
    return responseHandler(res, 200, `User blocked successfully`);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const findUser = await User.findById(req.userId);
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }
    findUser.blockedUsers = findUser.blockedUsers.filter(
      (user) => user.toString() !== id
    );
    const editUser = await findUser.save();
    if (!editUser) {
      return responseHandler(res, 400, `User unblock failed...!`);
    }
    return responseHandler(res, 200, `User unblocked successfully`);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.adminUserBlock = async (req, res) => {
  let status = "failure";
  let errorMessage = null;

  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }
    const findUser = await User.findById(id);
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }

    if (findUser.blockedUsers.includes(id)) {
      return responseHandler(res, 400, "User is already blocked");
    }

    const editUser = await User.findByIdAndUpdate(
      id,
      {
        $set: { status: "blocked" },
      },
      { new: true }
    );
    status = "success";
    if (!editUser) {
      return responseHandler(res, 400, `User update failed...!`);
    }
    return responseHandler(res, 200, `User blocked successfully`);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "user",
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

exports.adminUserUnblock = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }
    const findUser = await User.findById(id);
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }
    const editUser = await User.findByIdAndUpdate(
      id,
      {
        $set: { status: "active" },
      },
      { new: true }
    );

    status = "success";
    if (!editUser) {
      return responseHandler(res, 400, `User update failed...!`);
    }
    return responseHandler(res, 200, `User unblocked successfully`);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "user",
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

exports.listUserIdName = async (req, res) => {
  try {
    const filter = {
      _id: {
        $ne: req.userId,
      },
    };

    const totalCount = await User.countDocuments(filter);

    const data = await User.find(filter)
      .select("uid name")
      .sort({ name: 1 })
      .lean();

    return responseHandler(
      res,
      200,
      `Users fetched successfully!`,
      data,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.createMember = async (req, res) => {
  try {
    const check = req.user;
    if (check.role == "member") {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { error } = validations.createMemberSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const checkExist = await User.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });

    if (checkExist) {
      return responseHandler(
        res,
        409,
        `User with this email or phone already exists`
      );
    }

    const newUser = await User.create(req.body);

    if (newUser)
      return responseHandler(
        res,
        201,
        `New User created successfull..!`,
        newUser
      );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.analyticReview = async (req, res) => {
  try {
    const id = req.params.userId;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const findUser = await User.findById(id);
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }

    const feedsCount = await Feeds.countDocuments({ author: id });
    const productCount = await Products.countDocuments({ seller: id });

    const reviews = await Review.find({ toUser: id })
      .populate("reviewer", "name email")
      .select("comment rating createdAt");

    const userStats = {
      feedsCount,
      productCount,
      reviews,
    };

    return responseHandler(
      res,
      200,
      "User stats retrieved successfully",
      userStats
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.fetchDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const user = req.userId;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [
      businessGiven,
      businessReceived,
      refferalGiven,
      refferalReceived,
      oneToOneCount,
    ] = await Promise.all([
      Analytic.aggregate([
        {
          $match: {
            type: "Business",
            sender: new mongoose.Types.ObjectId(user),
            status: "accepted",
            ...filter,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$amount" } },
          },
        },
      ]),
      Analytic.aggregate([
        {
          $match: {
            type: "Business",
            member: new mongoose.Types.ObjectId(user),
            status: "accepted",
            ...filter,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$amount" } },
          },
        },
      ]),
      Analytic.aggregate([
        {
          $match: {
            type: "Refferal",
            sender: new mongoose.Types.ObjectId(user),
            status: "accepted",
            ...filter,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$amount" } },
          },
        },
      ]),
      Analytic.aggregate([
        {
          $match: {
            type: "Refferal",
            member: new mongoose.Types.ObjectId(user),
            status: "accepted",
            ...filter,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$amount" } },
          },
        },
      ]),
      Analytic.countDocuments({
        type: "One v One Meeting",
        status: "completed",
        ...filter,
        $or: [{ sender: user }, { member: user }],
      }),
    ]);

    return responseHandler(res, 200, "Dashboard data fetched successfully", {
      businessGiven: businessGiven[0]?.totalAmount || 0,
      businessReceived: businessReceived[0]?.totalAmount || 0,
      refferalGiven: refferalGiven[0]?.totalAmount || 0,
      refferalReceived: refferalReceived[0]?.totalAmount || 0,
      oneToOneCount,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getBusinessTags = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return responseHandler(res, 400, "Search query is required", []);
    }

    const users = await User.find(
      { businessTags: { $regex: search, $options: "i" } },
      { businessTags: 1, _id: 0 }
    );

    let allTags = users.flatMap((user) => user.businessTags);

    const filteredTags = allTags
      .filter((tag) => tag.toLowerCase().startsWith(search.toLowerCase()))
      .map((tag) => tag.trim());

    const uniqueTags = [...new Set(filteredTags)];

    return responseHandler(
      res,
      200,
      "Business Tags found successfully..!",
      uniqueTags
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.changePhoneNumber = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return responseHandler(res, 404, "User not found");
    }
    user.phone = phone;
    await user.save();
    return responseHandler(res, 200, "Phone number changed successfully");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
