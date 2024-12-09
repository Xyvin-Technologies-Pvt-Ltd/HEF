const express = require("express");
const userAccessController = require("../controllers/userAccessController");
const authVerify = require("../middlewares/authVerify");
const userAccessRoute = express.Router();

userAccessRoute
  .route("/")
  .post(userAccessController.createAccess)
  .get(userAccessController.getAccess);

userAccessRoute.put("/:id", userAccessController.editAccess);

module.exports = userAccessRoute;
