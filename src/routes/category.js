const express = require("express");
const categoryController = require("../controllers/categoryController");
const authVerify = require("../middlewares/authVerify");

const categoryRoute = express.Router();

categoryRoute.use(authVerify);

categoryRoute
  .route("/")
  .get(categoryController.getCategories)
  .post(categoryController.createCategory);

categoryRoute.get("/download-category", categoryController.downloadCategories);

categoryRoute
  .route("/:id")
  .get(categoryController.getCategoryById)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = categoryRoute;

