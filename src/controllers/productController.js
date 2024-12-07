const responseHandler = require("../helpers/responseHandler");
const Product = require("../models/productModel");
const validations = require("../validations");
const checkAccess = require("../helpers/checkAccess");

// Create a new product - admin
exports.createProduct = async (req, res) => {
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

// Get a single product by ID - admin
exports.getProduct = async (req, res) => {
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

    const product = await Product.findById(id);
    if (product) {
      return responseHandler(res, 200, "Product found successfully!", product);
    } else {
      return responseHandler(res, 404, "Product not found");
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

// Update a product by ID - admin
exports.updateProduct = async (req, res) => {
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
    if (updatedProduct) {
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
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

// Delete a product by ID - admin
exports.deleteProduct = async (req, res) => {
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
    if (deletedProduct) {
      return responseHandler(res, 200, "Product deleted successfully!");
    } else {
      return responseHandler(res, 404, "Product not found");
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
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
      .skip(skipCount)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    return responseHandler(
      res,
      200,
      "Products found successfully!",
      products,
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
    const { pageNo = 1, limit = 10 } = req.query;
    const filter = { status: "accepted" };

    const skip = (pageNo - 1) * limit;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalProducts = await Product.countDocuments(filter);

    const response = {
      totalProducts,
      currentPage: Number(pageNo),
      totalPages: Math.ceil(totalProducts / limit),
      products,
    };

    return responseHandler(res, 200, "Products found successfully!", response);
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
