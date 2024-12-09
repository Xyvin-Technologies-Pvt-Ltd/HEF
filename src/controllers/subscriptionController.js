const responseHandler = require("../helpers/responseHandler");
const Subscription = require("../models/subscriptionModel");
const validations = require("../validations");

exports.createSubscription = async (req, res) => {
  try {
    const createSubscriptionValidator =
      validations.createSubscriptionSchema.validate(req.body, {
        abortEarly: true,
      });

    if (createSubscriptionValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createSubscriptionValidator.error}`
      );
    }

    const findSubscription = await Subscription.findOne({
      user: req.body.user,
    });
    if (findSubscription) {
      return responseHandler(res, 400, "Subscription already exists");
    }

    const newSubscription = await Subscription.create(req.body);

    if (!newSubscription) {
      return responseHandler(res, 400, `Subscription creation failed...!`);
    }
    return responseHandler(
      res,
      201,
      `New Subscription added successfully..!`,
      newSubscription
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("user", "name image")
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    if (!subscriptions || subscriptions.length === 0) {
      return responseHandler(res, 400, `Subscriptions not found...!`);
    }

    const data = subscriptions.map((sub) => ({
      _id: sub._id,
      status: sub.status,
      userName: sub.user?.name || "",
      userImage: sub.user?.image || "",
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    }));

    return responseHandler(
      res,
      200,
      `Subscriptions found successfully`,
      data
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const updateSubscriptionValidator =
      validations.updateSubscriptionSchema.validate(req.body, {
        abortEarly: true,
      });

    if (updateSubscriptionValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${updateSubscriptionValidator.error}`
      );
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Subscription ID is required");
    }

    const findSubscription = await Subscription.findById(id);
    if (!findSubscription) {
      return responseHandler(res, 404, "Subscription not found");
    }

    const editSubscription = await Subscription.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!editSubscription) {
      return responseHandler(res, 400, `Subscription update failed...!`);
    }
    return responseHandler(
      res,
      200,
      `Subscription updated successfully`,
      editSubscription
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSubscriptionByUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }
    const findSubscription = await Subscription.findOne({ user: id });
    if (!findSubscription) {
      return responseHandler(res, 404, "Subscription not found");
    }
    return responseHandler(
      res,
      200,
      `Subscription found successfully`,
      findSubscription
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getUserSubscription = async (req, res) => {
  try {
    const { userId } = req;
    if (!userId) {
      return responseHandler(res, 400, "User ID is required");
    }
    const findSubscription = await Subscription.findOne({ user: userId });
    if (!findSubscription) {
      return responseHandler(res, 404, "Subscription not found");
    }
    return responseHandler(
      res,
      200,
      `Subscription found successfully`,
      findSubscription
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
