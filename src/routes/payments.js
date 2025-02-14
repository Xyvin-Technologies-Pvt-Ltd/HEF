const express = require("express");
const paymentController = require("../controllers/paymentsController");
const authVerify = require("../middlewares/authVerify");


const paymentRoute = express.Router();

paymentRoute.use(authVerify);

paymentRoute.post("/user",paymentController.createUserPayment);
paymentRoute
  .route("/parent-subscription")
  .post(paymentController.createParentSubscription)
  .get(paymentController.getParentSubscription);

paymentRoute.put("/update/:id",paymentController.updatePayment);

paymentRoute.get(
  "/user/:userId",paymentController.getUserPayments);



module.exports = paymentRoute;
