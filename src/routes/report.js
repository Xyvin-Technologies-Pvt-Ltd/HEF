const express = require("express");
const reportController = require("../controllers/reportController");
const authVerify = require("../middlewares/authVerify");
const reportRoute = express.Router();

reportRoute.use(authVerify);

reportRoute
  .route("/")
  .post(reportController.createReport)
  .get(reportController.getReports);

reportRoute.route("/:id").get(reportController.getSingleReport);

module.exports = reportRoute;
