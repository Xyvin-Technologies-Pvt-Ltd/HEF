const express = require("express");
const feedsController = require("../controllers/feedsController");
const authVerify = require("../middlewares/authVerify");
const feedsRoute = express.Router();

feedsRoute.use(authVerify);

feedsRoute.post("/", feedsController.createFeeds);

feedsRoute
  .route("/single/:id")
  .get(feedsController.getFeeds)
  .delete(feedsController.deletefeeds);

feedsRoute.get("/list", feedsController.getAllFeeds);
feedsRoute.get("/admin/list", feedsController.getAllFeedsForAdmin);
feedsRoute.get("/user/:id", feedsController.getUserFeeds);
feedsRoute.put("/single/:action/:id", feedsController.updateFeeds);
feedsRoute.get("/my-feeds", feedsController.getMyFeeds);

module.exports = feedsRoute;
