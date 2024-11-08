//const moment = require("moment-timezone");
const responseHandler = require("../helpers/responseHandler");
const News = require("../models/newsModel");
const validations = require("../validations");
const checkAccess = require("../helpers/checkAccess");
const User = require("../models/userModel");

exports.createNews = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("newsManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const createNewsValidator = validations.createNewsSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );

    if (createNewsValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createNewsValidator.error}`
      );
    }

    const newNews = await News.create(req.body);

    // const users = await User.find({
    //   status: { $in: ["active", "awaiting_payment"] },
    // }).select("fcm");
    // const fcmUser = users.map((user) => user.fcm);
    // const userIds = users.map((user) => user._id);
    //await sendInAppNotification(fcmUser, newNews.title, newNews.content);

    // await Notification.create({
    //   users: userIds,
    //   subject: newNews.title,
    //   content: newNews.content,
    //   type: "in-app",
    //});

    if (!newNews) {
      return responseHandler(res, 400, `news creation failed...!`);
    }
    return responseHandler(
      res,
      201,
      `New news created successfully..!`,
      newNews
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getNews = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("newsManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "news with this Id is required");
    }

    const findNews = await News.findById(id);
    if (findNews) {
      return responseHandler(res, 200, `news found successfully..!`, findNews);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateNews = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("newsManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "news Id is required");
    }

    const { error } = validations.editNewsSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const updateNews = await News.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (this.updateNews) {
      return responseHandler(
        res,
        200,
        `News updated successfully..!`,
        updateNews
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("newsManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "News Id is required");
    }

    const deleteNews = await News.findByIdAndDelete(id);
    if (deleteNews) {
      return responseHandler(res, 200, `news deleted successfully..!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("newsManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { pageNo = 1, status, limit = 10, search, category } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {};
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    if (category !== "All") {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }

    const totalCount = await News.countDocuments(filter);
    const data = await News.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    return responseHandler(
      res,
      200,
      `News found successfully..!`,
      data,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getUserNews = async (req, res) => {
  try {
    const filter = {
      status: "published",
    };
    const data = await News.find(filter).sort({ createdAt: -1 }).lean();

    return responseHandler(res, 200, `News found successfully..!`, data);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
