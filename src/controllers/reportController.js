const checkAccess = require("../helpers/checkAccess");
const responseHandler = require("../helpers/responseHandler");
const Report = require("../models/reportModel");
const User = require("../models/userModel");
const validations = require("../validations");

exports.createReport = async (req, res) => {
  try {
    const { error } = validations.createReport.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    req.body.reportBy = req.userId;
    const newReport = await Report.create(req.body);
    if (newReport) {
      return responseHandler(
        res,
        201,
        "Report created successfullyy",
        newReport
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getReports = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("reportManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { pageNo = 1, limit = 10, search } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {};

    if (search) {
      filter.$or = [{ reportType: { $regex: search, $options: "i" } }];
    }
    const totalCount = await Report.countDocuments(filter);
    const data = await Report.find(filter)
      .populate("reportBy", "name")
      .populate("content")
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    const mappedData = data.map((item) => {
      let content = "";

      if (item.reportType === "Feeds") {
        content = item.content?.content || "";
      } else if (item.reportType === "User") {
        content = `${item.content?.name || ""}`.trim();
      } else if (item.reportType === "Product") {
        content = `${item.content?.name || ""}`.trim();
      } else if (item.reportType === "Message") {
        content = item.content?.content || "Chat";
      }

      return {
        _id: item._id,
        content: content,
        reportType: item.reportType,
        reportBy: `${item.reportBy?.name || ""}`.trim(),
      };
    });

    return responseHandler(
      res,
      200,
      `Reports found successfully..!`,
      mappedData,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSingleReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Report ID is required");
    }

    const report = await Report.findById(id)
      .populate("reportBy", "name")
      .populate("content")
      .lean();

    if (!report) {
      return responseHandler(res, 404, "Report not found");
    }

    if (report.reportType === "Message" && report.content) {
      const fromUser = await User.findById(report.content.from).select("name");
      const toUser = await User.findById(report.content.to).select("name");
      report.content.from = fromUser || { name: "Unknown" };
      report.content.to = toUser || { name: "Unknown" };
    } else if (report.reportType === "Feeds" && report.content) {
      const author = await User.findById(report.content.author).select("name");
      report.content.author = author || { name: "Unknown" };
    } else if (report.reportType === "Product" && report.content) {
      const seller = await User.findById(report.content.seller).select("name");
      report.content.seller = seller || { name: "Unknown" };
    }

    return responseHandler(res, 200, "Report found successfully", report);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
