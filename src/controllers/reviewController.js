const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const Review = require("../models/reviewModel");

exports.createReview = async (req, res) => {
  try {
    const { error } = validations.createReviewSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    req.body.reviewer = req.userId;

    const review = await Review.create(req.body);
    return responseHandler(res, 201, "Review added successfully", review);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { userId } = req.query;

    const reviews = await Review.find({ toUser: userId }).populate(
      "reviewer",
      "name image"
    );
    return responseHandler(res, 200, "Reviews fetched successfully", reviews);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.editReviews = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { error } = validations.updateReviewSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, {
      new: true,
    });
    if (!updatedReview) {
      return responseHandler(res, 404, "Review not found");
    }

    return responseHandler(
      res,
      200,
      "Review updated successfully",
      updatedReview
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteReviews = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    if (!deletedReview) {
      return responseHandler(res, 404, "Review not found");
    }

    return responseHandler(res, 200, "Review deleted successfully");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
