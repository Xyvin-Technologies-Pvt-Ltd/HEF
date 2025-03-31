const responseHandler = require("../helpers/responseHandler");
const Product = require("../models/productModel");
const validations = require("../validations");
const checkAccess = require("../helpers/checkAccess");
const logActivity = require("../models/logActivityModel");
const User = require("../models/userModel");
const sendInAppNotification = require("../utils/sendInAppNotification");
// Create a new product - admin
exports.createProduct = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("productManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const createProductValidator = validations.createProductSchema.validate(
      req.body,
      { abortEarly: true }
    );
    if (createProductValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createProductValidator.error.message}`
      );
    }

    const newProduct = await Product.create(req.body);
    if (!newProduct) {
      return responseHandler(res, 400, "Product creation failed!");
    }
    status = "success";
    return responseHandler(
      res,
      201,
      "New product created successfully!",
      newProduct
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "product",
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

// Get a single product by ID - admin
exports.getProduct = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("productManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Product ID is required");
    }

    const product = await Product.findById(id).populate(
      "seller",
      "name image memberId"
    );
    status = "success";
    if (product) {
      return responseHandler(res, 200, "Product found successfully!", product);
    } else {
      return responseHandler(res, 404, "Product not found");
    }
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "product",
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

// Update a product by ID - admin
exports.updateProduct = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("productManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Product ID is required");
    }

    const { error } = validations.updateProductSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    status = "success";
    if (updatedProduct) {
      if (req.body.status) {
        const toUser = await User.findById(updatedProduct.seller).select("fcm");
        const fcmUser = [toUser.fcm];

        await sendInAppNotification(
          fcmUser,
          `Your Product request has been ${req.body.status}`,
          `Your Product request has been ${req.body.status} for ${updatedProduct.name}`,
          null,
          "my_products"
        );
      }
      return responseHandler(
        res,
        200,
        "Product updated successfully!",
        updatedProduct
      );
    } else {
      return responseHandler(res, 404, "Product not found");
    }
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "product",
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

exports.updateProductByUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Product ID is required");
    }

    const { error } = validations.updateProductSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    req.body.status = "pending";

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return responseHandler(
      res,
      200,
      "Product updated successfully!",
      updatedProduct
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

// Delete a product by ID - admin
exports.deleteProduct = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("productManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "Product ID is required");
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    status = "success";
    if (deletedProduct) {
      return responseHandler(res, 200, "Product deleted successfully!");
    } else {
      return responseHandler(res, 404, "Product not found");
    }
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "product",
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

exports.getAllProducts = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("productManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { pageNo = 1, limit = 10, search, status, category } = req.query;
    const skipCount = (pageNo - 1) * limit;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    const totalCount = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("seller", "name")
      .skip(skipCount)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const mappedData = products.map((item) => {
      return {
        ...item,
        sellerName: item?.seller?.name,
      };
    });

    return responseHandler(
      res,
      200,
      "Products found successfully!",
      mappedData,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.createProductByUser = async (req, res) => {
  try {
    const createProductValidator = validations.createProductSchema.validate(
      req.body,
      { abortEarly: true }
    );
    if (createProductValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createProductValidator.error.message}`
      );
    }

    const productData = {
      ...req.body,
      seller: req.userId,
    };

    const newProduct = await Product.create(productData);
    if (!newProduct) {
      return responseHandler(res, 400, "Product creation failed!");
    }

    return responseHandler(
      res,
      201,
      "New product created successfully!",
      newProduct
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getUserProducts = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10, search } = req.query;
    const filter = { status: "accepted" };

    const skip = (pageNo - 1) * limit;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalProducts = await Product.countDocuments(filter);

    return responseHandler(
      res,
      200,
      "Products found successfully!",
      products,
      totalProducts
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

// exports.getAllProductsUser = async (req, res) => {
//   try {
//     const {
//       pageNo = 1,
//       limit = 10,
//       search,
//       category,
//       sortBy = "createdAt",
//       order = "desc",
//     } = req.query;
//     const skipCount = (pageNo - 1) * limit;
//     const filter = { status: "accepted" };

//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     if (category) {
//       filter.category = category;
//     }

//     const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;

//     const totalCount = await Product.countDocuments(filter);

//     const products = await Product.find(filter)
//       .skip(skipCount)
//       .limit(parseInt(limit))
//       .sort({ [sortBy]: sortOrder })
//       .lean();

//     return responseHandler(res, 200, "Products retrieved successfully!", {
//       products,
//       totalCount,
//       pageNo,
//       limit,
//     });
//   } catch (error) {
//     return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
//   }
// };

exports.fetchMyProducts = async (req, res) => {
  try {
    const id = req.userId;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const products = await Product.find({ seller: id }).sort({ createdAt: -1 });

    if (!products.length) {
      return responseHandler(res, 404, "No products found");
    }

    return responseHandler(
      res,
      200,
      "Products fetched successfully!",
      products
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.fetchUserProducts = async (req, res) => {
  try {
    const id = req.params.userId;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }

    const products = await Product.find({ seller: id })
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 });

    if (!products.length) {
      return responseHandler(res, 404, "No products found");
    }

    return responseHandler(
      res,
      200,
      "Products fetched successfully!",
      products
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.deleteUserProduct = async (req, res) => {
  try {
    const id = req.params.productId;
    if (!id) {
      return responseHandler(res, 400, "Product ID is required");
    }

    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return responseHandler(res, 404, "Product not found");
    }

    if (findProduct.seller.toString() !== req.userId) {
      return responseHandler(
        res,
        403,
        "You are not authorized to delete this product"
      );
    }

    await Product.findByIdAndDelete(id);

    return responseHandler(res, 200, "Product deleted successfully!");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
