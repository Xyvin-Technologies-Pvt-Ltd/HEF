const express = require("express");
const analyticControler = require("../controllers/analyticControler");
const authVerify = require("../middlewares/authVerify");
const analyticRoute = express.Router();

analyticRoute.use(authVerify);

analyticRoute
  .route("/")
  .post(analyticControler.sendRequest)
  .get(analyticControler.getRequests);

analyticRoute.get("/download", analyticControler.downloadRequests);
analyticRoute.post("/status", analyticControler.updateRequestStatus);
analyticRoute.delete("/:requestId", analyticControler.deleteRequestById);
analyticRoute.get(
  "/chapter/:chapterId",
  analyticControler.getRequestsByChapter
);

module.exports = analyticRoute;
