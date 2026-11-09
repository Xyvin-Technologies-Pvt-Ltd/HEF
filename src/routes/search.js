const express = require("express");
const authVerify = require("../middlewares/authVerify");
const searchController = require("../controllers/searchController");

const searchRoute = express.Router();

searchRoute.use(authVerify);
searchRoute.get("/", searchController.globalSearch);

module.exports = searchRoute;
