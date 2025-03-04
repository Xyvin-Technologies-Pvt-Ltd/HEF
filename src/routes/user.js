const express = require("express");
const userController = require("../controllers/userController");
const authVerify = require("../middlewares/authVerify");
const userRoute = express.Router();

userRoute.post("/send-otp", userController.sendOtp);
userRoute.post("/verify", userController.verifyUser);
userRoute.post("/login", userController.loginUser);
userRoute.get("/app-version", userController.getVersion);

userRoute.use(authVerify);

userRoute.get("/", userController.fetchUser);
userRoute.get("/users", userController.getUsers);
userRoute.get("/single/:id", userController.getSingleUser);
userRoute.patch("/update", userController.updateUser);
userRoute.post("/", userController.createNewUser);
userRoute.post("/admin", userController.createUser);
userRoute.post("/member", userController.createMember);
userRoute
  .route("/admin/single/:id")
  .put(userController.editUser)
  .get(userController.getUser)
  .delete(userController.deleteUser);

userRoute.get("/admin/list", userController.getAllUsers);
userRoute.get("/list", userController.listUsers);
userRoute.get("/listuid", userController.listUserIdName);

userRoute.get("/approvals", userController.getApprovals);
userRoute.put("/approval/:id", userController.approveUser);

userRoute.put("/block/:id", userController.blockUser);
userRoute.put("/unblock/:id", userController.unblockUser);

userRoute.patch("/admin/block-user/:id", userController.adminUserBlock);
userRoute.patch("/admin/unblock-user/:id", userController.adminUserUnblock);

userRoute.patch("/analytic-review/:userId", userController.analyticReview);

userRoute.get("/dashboard", userController.fetchDashboard);

module.exports = userRoute;
