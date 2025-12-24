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
analyticRoute.get("/download-app", analyticControler.downloadActivitiesApp);
analyticRoute.post("/status", analyticControler.updateRequestStatus);
analyticRoute.delete("/:requestId", analyticControler.deleteRequestById);
analyticRoute.get(
  "/chapter/:chapterId",
  analyticControler.getRequestsByChapter
);
analyticRoute.put("/:requestId", analyticControler.updateRequest);
module.exports = analyticRoute;
