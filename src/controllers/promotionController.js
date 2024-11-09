//const moment = require("moment-timezone");
const responseHandler = require("../helpers/responseHandler");
const Promotion = require("../models/promotionModel");
const validations = require("../validations");
const checkAccess = require("../helpers/checkAccess");

exports.createPromotion = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("promotionManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const createPromotionValidator = validations.createPromotionSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );

    if (createPromotionValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createPromotionValidator.error}`
      );
    }

    const newPromotion = await Promotion.create(req.body);
    if (!newPromotion) {
      return responseHandler(res, 400, `Promotion creation failed...!`);
    }
    return responseHandler(
      res,
      201,
      `New Promotion created successfullyy..!`,
      newPromotion
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getPromotion = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("promotionManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "promotion with this Id is required");
    }

    const findPromotion = await Promotion.findById(id);
    if (findPromotion) {
      return responseHandler(
        res,
        200,
        `Promotion found successfully..!`,
        findPromotion
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("promotionManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "Promotion Id is required");
    }

    const { error } = validations.editPromotionSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const updatePromotion = await Promotion.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (this.updatePromotion) {
      return responseHandler(
        res,
        200,
        `Promotion updated successfully..!`,
        updatePromotion
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("promotionManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "Promotion Id is required");
    }

    const deletePromotion = await Promotion.findByIdAndDelete(id);
    if (deletePromotion) {
      return responseHandler(res, 200, `promotion deleted successfully..!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllPromotion = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("promotionManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { pageNo = 1, status, type, limit = 10 } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {};
    if (type) {
      filter.type = type;
    }
    const totalCount = await Promotion.countDocuments(filter);
    const data = await Promotion.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    return responseHandler(
      res,
      200,
      `Promotions found successfully..!`,
      data,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getUserPromotion = async (req, res) => {
  try {
    const filter = {};
    const today = moment().toISOString();
    filter.endDate = {
      $gte: today,
    };
    filter.startDate = {
      $lte: today,
    };
    const data = await Promotion.find(filter).sort({ createdAt: -1 }).lean();

    return responseHandler(res, 200, `Promotions found successfully..!`, data);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};