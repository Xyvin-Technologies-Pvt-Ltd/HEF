const express = require("express");
const productController = require("../controllers/productController");
const authVerify = require("../middlewares/authVerify");
const productRoute = express.Router();

productRoute.use(authVerify);

productRoute
  .route("/admin")
  .post(productController.createProduct)
  .get(productController.getAllProducts);
productRoute.get("/", productController.getUserProducts);

productRoute.get("/myproducts", productController.fetchMyProducts);
productRoute.get("/admin/:userId", productController.fetchUserProducts);
productRoute.delete("/user/:productId", productController.deleteUserProduct);

productRoute
  .route("/single/:id")
  .get(productController.getProduct)
  .put(productController.updateProduct)
  .patch(productController.updateProductByUser)
  .delete(productController.deleteProduct);

productRoute.route("/user").post(productController.createProductByUser);

module.exports = productRoute;
