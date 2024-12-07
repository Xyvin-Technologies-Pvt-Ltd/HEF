const express = require("express");
const subscriptionController = require("../controllers/subscriptionController");
const authVerify = require("../middlewares/authVerify");
const subscriptionRoute = express.Router();

subscriptionRoute.use(authVerify);

subscriptionRoute
  .route("/")
  .post(subscriptionController.createSubscription)
  .get(subscriptionController.getSubscriptions);

subscriptionRoute
  .route("/single/:id")
  .put(subscriptionController.updateSubscription)
  .get(subscriptionController.getSubscriptionByUser);

subscriptionRoute.get("/user", subscriptionController.getUserSubscription);

module.exports = subscriptionRoute;
