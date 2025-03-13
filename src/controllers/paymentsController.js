require("dotenv").config();
const { getMessaging } = require("firebase-admin/messaging");
const responseHandler = require("../helpers/responseHandler");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const {
  PaymentSchema,
  UserPaymentSchema,
  createParentSubSchema,
  editParentSubSchema,
} = require("../validations/index");
const ParentSub = require("../models/parentSubModel");
const sendInAppNotification = require("../utils/sendInAppNotification");

exports.updatePayment = async (req, res) => {
  try {
    const { error } = PaymentSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const { id } = req.params;

    await Payment.findByIdAndUpdate(id, { status: "expired" }, { new: true });

    const payment = await Payment.create(req.body);

    if (!payment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      if (req.body.category === "app") {
        const user = await User.findOneAndUpdate(
          { _id: req.body.user },
          { subscription: "premium" },
          { new: true }
        );
        await sendInAppNotification(
          user.fcm,
          "Your subscription has been updated",
          "Your subscription for our app has been updated. Please explore the app for more features and benefits.",
          null,
          "my_subscriptions"
        );
      } else if (req.body.category === "membership") {
        const user = await User.findOneAndUpdate(
          { _id: req.body.user },
          { status: "active" },
          { new: true }
        );
        await sendInAppNotification(
          user.fcm,
          "Your membership has been updated",
          "Your membership for our app has been updated. Please explore the app",
          null,
          "my_subscriptions"
        );
      }
    }

    return responseHandler(res, 200, "Payment updated successfully!", payment);
  } catch (err) {
    return responseHandler(res, 500, `Error saving payment: ${err.message}`);
  }
};

exports.getUserPayments = async (req, res) => {
  const { userId } = req.params;

  try {
    const appPayment = await Payment.findOne({ user: userId, category: "app" })
      .sort({ createdAt: -1 })
      .populate("parentSub")
      .lean();

    const membershipPayment = await Payment.findOne({
      user: userId,
      category: "membership",
    })
      .sort({ createdAt: -1 })
      .populate("parentSub")
      .lean();

    const payments = [];

    if (appPayment) {
      payments.push(appPayment);
    }

    if (membershipPayment) {
      payments.push(membershipPayment);
    }

    return responseHandler(
      res,
      200,
      "Successfully retrieved payments",
      payments,
      payments.length
    );
  } catch (error) {
    return responseHandler(res, 500, "Error retrieving payments", error);
  }
};

exports.createUserPayment = async (req, res) => {
  const userId = req.userId;
  const data = req.body;

  if (!userId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const user = await User.findById(userId);
  if (!user) {
    return responseHandler(res, 404, "User not found");
  }

  const { error } = UserPaymentSchema.validate(data, {
    abortEarly: true,
  });

  const payment_exist = await Payment.findOne({
    category: data.category,
    member: userId,
    status: { $in: ["accepted", "expiring"] },
  });

  if (payment_exist) {
    payment_exist.status == "expired";
    await payment_exist.save();
  }

  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  const newPayment = new Payment({
    ...data,
    user: userId,
  });

  try {
    await newPayment.save();
    return responseHandler(
      res,
      201,
      "Payment submitted successfully!",
      newPayment
    );
  } catch (err) {
    return responseHandler(res, 500, `Error saving payment: ${err.message}`);
  }
};

exports.createParentSubscription = async (req, res) => {
  try {
    const { error } = createParentSubSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const payment = await ParentSub.create(req.body);
    if (!payment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      return responseHandler(res, 200, "Payment saved successfully", payment);
    }
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};

exports.getParentSubscription = async (req, res) => {
  try {
    const payment = await ParentSub.find();
    if (!payment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      return responseHandler(res, 200, "Payment saved successfully", payment);
    }
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { error } = PaymentSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const newPayment = await Payment.create(req.body);

    if (!newPayment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      if (req.body.category === "app") {
        await User.findOneAndUpdate(
          { _id: req.body.user },
          { subscription: "premium" },
          { new: true }
        );
      } else if (req.body.category === "membership") {
        await User.findOneAndUpdate(
          { _id: req.body.user },
          { status: "active" },
          { new: true }
        );
      }
    }

    return responseHandler(
      res,
      201,
      "Payment submitted successfully!",
      newPayment
    );
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10, search, status } = req.query;
    const skipCount = (pageNo - 1) * limit;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [{ "user.name": { $regex: search, $options: "i" } }];
    }

    const payments = await Payment.find(filter)
      .populate("user", "name")
      .populate("parentSub", "expiryDate")
      .skip(skipCount)
      .limit(limit)
      .sort({ _id: -1 })
      .lean();

    const totalCount = await Payment.countDocuments(filter);

    const mappedData = payments.map((item) => {
      return {
        ...item,
        user: item.user.name,
        expiryDate: item.parentSub?.expiryDate,
      };
    });

    return responseHandler(
      res,
      200,
      "Successfully retrieved payments",
      mappedData,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};

exports.getSinglePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate("user", "name");
    if (!payment) {
      return responseHandler(res, 404, "Payment not found");
    }

    return responseHandler(res, 200, "Successfully retrieved payment", payment);
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return responseHandler(res, 404, "Payment not found");
    }

    return responseHandler(res, 200, "Successfully deleted payment", payment);
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let payment = await Payment.findById(id);
    if (!payment) {
      return responseHandler(res, 404, "Payment details do not exist");
    }

    let user = await User.findById(payment.user);

    if (!user) {
      return responseHandler(res, 404, "User not found");
    }
    if (status == "cancelled" && payment.category == "app") {
      user.subscription = "free";
      payment.status = "cancelled";
    } else if (status == "cancelled" && payment.category == "membership") {
      user.status = "inactive";
      payment.status = "cancelled";
    } else if (status == "accepted" && payment.category == "app") {
      user.subscription = "premium";
      payment.status = "active";
    } else if (status == "accepted" && payment.category == "membership") {
      user.status = "active";
      payment.status = "active";
    }
    await user.save();
    await payment.save();

    const message = {
      notification: {
        title: `HEF Payment has been ${status}`,
        body: `HEF Payment for ${payment.category} has been ${status}, please check your account`,
      },
      token: user.fcm,
    };

    getMessaging()
      .send(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });

    return responseHandler(
      res,
      200,
      "Payment status updated successfully",
      payment
    );
  } catch (err) {
    return responseHandler(res, 500, `Error saving payment: ${err.message}`);
  }
};

exports.updateParentSubscription = async (req, res) => {
  try {
    const { error } = editParentSubSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const { id } = req.params;
    const payment = await ParentSub.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!payment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      return responseHandler(res, 200, "Payment saved successfully", payment);
    }
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};

exports.getSingleParentSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await ParentSub.findById(id);
    if (!payment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      return responseHandler(res, 200, "Payment saved successfully", payment);
    }
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};
