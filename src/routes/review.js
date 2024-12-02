const express = require("express");
const reviewController = require("../controllers/reviewController");
const authVerify = require("../middlewares/authVerify");
const reviewRoute = express.Router();


reviewRoute.use(authVerify);

reviewRoute
  .route("/")
  .post(reviewController.createReview)
  .get(reviewController.getReviews);

reviewRoute
  .route("/single/:id")
  .put(reviewController.editReviews)
  .delete(reviewController.deleteReviews);

module.exports = reviewRoute;
