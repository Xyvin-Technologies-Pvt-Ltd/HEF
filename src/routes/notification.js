const express = require("express");
const notificationController = require("../controllers/notificationController");
const authVerify = require("../middlewares/authVerify");
const notificationRoute = express.Router();

notificationRoute.use(authVerify);

notificationRoute
  .route("/")
  .post(notificationController.createNotification)
  .get(notificationController.getNotifications);

notificationRoute.get("/user", notificationController.getUserNotifications);

notificationRoute.post(
  "/level",
  notificationController.createLevelNotification
);

notificationRoute.get("/:id", notificationController.getNotification);

module.exports = notificationRoute;
