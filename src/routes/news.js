const express = require("express");
const newsController = require("../controllers/newsController");
const authVerify = require("../middlewares/authVerify");
const newsRoute = express.Router();

newsRoute.use(authVerify);

newsRoute.post("/", newsController.createNews);

newsRoute
  .route("/single/:id")
  .get(newsController.getNews)
  .put(newsController.updateNews)
  .delete(newsController.deleteNews);

newsRoute.get("/list", newsController.getAllNews);
newsRoute.get("/user", newsController.getUserNews);

module.exports = newsRoute;