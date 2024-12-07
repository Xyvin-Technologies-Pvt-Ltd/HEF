const express = require("express");
const userController = require("../controllers/userController");
const authVerify = require("../middlewares/authVerify");
const userAccessRoute = express.Router();

userAccessRoute
  .route("/")
  .post(userAccessController.createAccess)
  .get(userAccessController.getAccess);

  userAccessRoute.put("/:Id", userAccessController.unblockUser);

module.exports = userAccessRoute;
