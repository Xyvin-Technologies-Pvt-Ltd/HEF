const responseHandler = require("../helpers/responseHandler");
const Report = require("../models/reportModel");
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
        content = `${item.content?.name?.first || ""} ${
          item.content?.name?.middle || ""
        } ${item.content?.name?.last || ""}`.trim();
      } else if (item.reportType === "Message") {
        content = item.content?.content || "Chat";
      }

      return {
        _id: item._id,
        content: content,
        reportType: item.reportType,
        reportBy: `${item.reportBy?.name?.first || ""} ${
          item.reportBy?.name?.middle || ""
        } ${item.reportBy?.name?.last || ""}`.trim(),
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