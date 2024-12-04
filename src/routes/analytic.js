const express = require("express");
const analyticControler = require("../controllers/analyticControler");
const authVerify = require("../middlewares/authVerify");
const analyticRoute = express.Router();

analyticRoute.use(authVerify);

analyticRoute
  .route("/")
  .post(analyticControler.sendRequest)
  .get(analyticControler.viewAllRequestSend);

analyticRoute.get("/send", analyticControler.getSentRequests);
analyticRoute.get("/received", analyticControler.getReceivedRequests);
analyticRoute.get("/history", analyticControler.getHistory);
// analyticRoute.get("/send/:id",analyticControler.getSentRequestById);

module.exports = analyticRoute;
