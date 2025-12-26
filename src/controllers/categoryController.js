const moment = require("moment-timezone");
const responseHandler = require("../helpers/responseHandler");
const Category = require("../models/categoryModel");
const validations = require("../validations");
const checkAccess = require("../helpers/checkAccess");
const logActivity = require("../models/logActivityModel");
const User = require("../models/userModel");

exports.getCategories = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {

    const {
      pageNo = 1,
      limit = 10,
      search,
      name,
      isAll = false,
      status: categoryStatus,
    } = req.query;
     const skipCount = Number(limit) * (pageNo - 1);
    const filter = {};

    if (name) {
      filter.name = name;
    } else if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (categoryStatus !== undefined) {
      filter.status = categoryStatus === "true" || categoryStatus === true;
    }

    const totalCount = await Category.countDocuments(filter);

    let data;
    if (isAll === true || isAll === "true") {
      data = await Category.find(filter).sort({ createdAt: -1, _id: -1 });
    } else {
      data = await Category.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "users",
            let: { catId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$category", "$$catId"] },
                  status: { $ne: "deleted" },
                },
              },
              { $count: "memberCount" },
            ],
            as: "member_meta",
          },
        },
        {
          $addFields: {
            memberCount: {
              $ifNull: [{ $arrayElemAt: ["$member_meta.memberCount", 0] }, 0],
            },
          },
        },
        { $project: { member_meta: 0 } },
        { $sort: { name: 1 } },
        { $skip: skipCount },
        { $limit: Number(limit) },
      ]);
    }
    status = "success";
    return responseHandler(
      res,
      200,
      "Categories fetched successfully",
      data,
      totalCount
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "category",
      description: "Category fetch",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.createCategory = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const access = await checkAccess(req.roleId, "permissions");
    if (
      !access ||
      (!access.includes("categoryManagement_modify") &&
        !access.includes("memberManagement_modify"))
    ) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { error } = validations.createCategorySchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const existing = await Category.findOne({ name: req.body.name });
    if (existing) {
      return responseHandler(
        res,
        400,
        "Category with this name already exists"
      );
    }

    const category = await Category.create(req.body);
    status = "success";
    return responseHandler(
      res,
      201,
      "Category created successfully",
      category
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "category",
      description: "Category creation",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Category ID is required");
    }

    const category = await Category.findById(id);
    status = "success";
    return responseHandler(
      res,
      200,
      "Category fetched successfully",
      category
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "category",
      description: "Category fetch by id",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.updateCategory = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const access = await checkAccess(req.roleId, "permissions");
    if (
      !access ||
      (!access.includes("categoryManagement_modify") &&
        !access.includes("memberManagement_modify"))
    ) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { error } = validations.editCategorySchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Category ID is required");
    }

    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    status = "success";
    return responseHandler(
      res,
      200,
      "Category updated successfully",
      category
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "category",
      description: "Category update",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const access = await checkAccess(req.roleId, "permissions");
    if (
      !access ||
      (!access.includes("categoryManagement_modify") &&
        !access.includes("memberManagement_modify"))
    ) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Category ID is required");
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    status = "success";
    return responseHandler(
      res,
      200,
      "Category deleted successfully",
      category
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "category",
      description: "Category delete",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.downloadCategories = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {

    const categories = await Category.aggregate([
      { $match: { status: true } },
      {
        $lookup: {
          from: "users",
          let: { catId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$catId"] },
                status: { $ne: "deleted" },
              },
            },
            { $count: "memberCount" },
          ],
          as: "member_meta",
        },
      },
      {
        $addFields: {
          memberCount: {
            $ifNull: [{ $arrayElemAt: ["$member_meta.memberCount", 0] }, 0],
          },
        },
      },
      { $project: { member_meta: 0 } },
      { $sort: { name: 1 } },
    ]);

    const header = "Name,Status,Members,Created On\n";
    const rows = categories
      .map((cat) => {
        const created = moment(cat.createdAt).format("DD-MM-YYYY");
        const statusText = cat.status ? "Active" : "Inactive";
        return `${cat.name},${statusText},${cat.memberCount || 0},${created}`;
      })
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=categories_list.csv"
    );
    status = "success";
    return res.status(200).send(header + rows);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "category",
      description: "Category download",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.getCategoryMembers = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {

    const { id } = req.params;
    const { pageNo = 1, limit = 10, search } = req.query;
     const skipCount = Number(limit) * (pageNo - 1);

    if (!id) {
      return responseHandler(res, 400, "Category ID is required");
    }
    const filter = {
      category: id,
      status: { $ne: "deleted" },
    };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { memberId: { $regex: search, $options: "i" } },
      ];
    }
    const totalCount = await User.countDocuments(filter);
    const members = await User.find(filter)
      .populate("category", "name")
      .sort({ name: 1 })
      .skip(skipCount)
      .limit(limit)
      .lean();

    status = "success";
    return responseHandler(
      res,
      200,
      "Members fetched successfully",
      members,
      totalCount
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "category",
      description: "Category members fetch",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};