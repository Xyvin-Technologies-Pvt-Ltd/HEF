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
eventRoute.get("/:eventId/rsvp", eventController.getrsvp)
eventRoute.patch("/single/:eventId/remove-rsvp",authVerify,eventController.removeRsvp);

eventRoute.get("/reg-events", eventController.getRegEvents);

eventRoute.post("/attend/:eventId", eventController.markAttendance);
eventRoute.get("/attend/:eventId", eventController.getAttendedUsers);
eventRoute.post("/:eventId/guests/add", eventController.addGuest);
eventRoute.put("/:eventId/guests/:guestId/edit", eventController.editGuest);
eventRoute.delete("/:eventId/guests/:guestId/delete", eventController.deleteGuest);
eventRoute.get("/download", eventController.downloadEvents);
eventRoute.get("/:eventId/download", eventController.downloadGuests);
eventRoute.get("/:eventId/download-rsvp", eventController.downloadRsvp);


module.exports = eventRoute;