const express = require("express");
const eventController = require("../controllers/eventController");
const eventRoute = express.Router();
const authVerify = require("../middlewares/authVerify");

eventRoute.use(authVerify);

eventRoute.route("/").post(eventController.createEvent);

eventRoute.get("/list", eventController.getAllEvents);
eventRoute.get("/admin/list", eventController.getAllEventsForAdmin);

eventRoute
  .route("/single/:id")
  .put(eventController.editEvent)
  .get(eventController.getSingleEvent)
  .delete(eventController.deleteEvent)
  .patch(eventController.addRSVP);

eventRoute.get("/reg-events", eventController.getRegEvents);

eventRoute.post("/attend/:eventId", eventController.markAttendance);
eventRoute.get("/attend/:eventId", eventController.getAttendedUsers);

module.exports = eventRoute;
