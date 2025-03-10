const express = require("express");
const hierarchyController = require("../controllers/hierarchyController");
const authVerify = require("../middlewares/authVerify");
const hierarchyRoute = express.Router();
hierarchyRoute.use(authVerify);

// State Routes

hierarchyRoute.get("/state/list", hierarchyController.getAllStates);
hierarchyRoute.post("/state", hierarchyController.createState);
hierarchyRoute.get("/state/:id", hierarchyController.getState);
hierarchyRoute.put("/state/:id", hierarchyController.updateState);

// Zone Routes
hierarchyRoute.post("/zone", hierarchyController.createZone);
hierarchyRoute.get("/zone/:id", hierarchyController.getZone);
hierarchyRoute.put("/zone/:id", hierarchyController.updateZone);

// District Routes
hierarchyRoute.post("/district", hierarchyController.createDistrict);
hierarchyRoute.get("/district/list", hierarchyController.getAllDistricts);
hierarchyRoute.get("/district/:id", hierarchyController.getDistrict);
hierarchyRoute.put("/district/:id", hierarchyController.updateDistrict);

// Chapter Routes
hierarchyRoute.post("/chapter", hierarchyController.createChapter);
hierarchyRoute.get("/chapter/list", hierarchyController.getAllChapters);
hierarchyRoute.get("/chapter/:id", hierarchyController.getChapter);
hierarchyRoute.put("/chapter/:id", hierarchyController.updateChapter);

hierarchyRoute.get("/levels/:id/:type", hierarchyController.getLevels);
hierarchyRoute.get("/list/:type", hierarchyController.getHierarchyList);

hierarchyRoute
  .route("/level/:type")
  .post(hierarchyController.createLevel)
  .get(hierarchyController.getLevel)
  .put(hierarchyController.updateLevel)
  .delete(hierarchyController.deleteLevel);

module.exports = hierarchyRoute;
