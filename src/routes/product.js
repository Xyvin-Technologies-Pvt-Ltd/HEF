const express = require("express");
const productController = require("../controllers/productController");
const authVerify = require("../middlewares/authVerify");
const productRoute = express.Router();

productRoute.use(authVerify);

productRoute
  .route("/admin")
  .post(productController.createProduct)
  .get(productController.getAllProducts);
productRoute
  .route("/")
  .get(productController.getUserProducts);
productRoute
  .route("/single/:id")
  .get(productController.getProduct)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);


productRoute.route("/user").post(productController.createProductByUser);

module.exports = productRoute;
