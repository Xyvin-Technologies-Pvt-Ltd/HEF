const checkAccess = require("../helpers/checkAccess");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const Event = require("../models/eventModel");
const { getMessaging } = require("firebase-admin/messaging");
const User = require("../models/userModel");
const logActivity = require("../models/logActivityModel");
const sendInAppNotification = require("../utils/sendInAppNotification");

exports.createEvent = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("eventManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { error } = validations.createEventSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const existingEvent = await Event.findOne({
      eventName: req.body.eventName,
    });
    if (existingEvent) {
      return responseHandler(
        res,
        400,
        `An event with the name "${req.body.eventName}" already exists.`
      );
    }
    const newEvent = await Event.create(req.body);
    const users = await User.find({
      status: "active",
    }).select("fcm");
    let FCM = [];
    if (users.length > 0) {
      FCM = users.map((user) => user.fcm);
    }
    if (newEvent) {
      await sendInAppNotification(
        FCM,
        newEvent.eventName,
        newEvent.description,
        newEvent.image
      );
      return responseHandler(
        res,
        201,
        `New Event created successfull..!`,
        newEvent
      );
    }
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "event",
      description: "Event creation",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.editEvent = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("eventManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { error } = validations.editEventSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEvent) {
      return responseHandler(res, 404, "Event not found");
    }

    status = "success";

    return responseHandler(
      res,
      200,
      `Event updated successfully!`,
      updatedEvent
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "event",
      description: "Event update",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("eventManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    status = "success";

    if (!deletedEvent) {
      return responseHandler(res, 404, "Event not found");
    }
    return responseHandler(res, 200, `Event deleted successfully`);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "event",
      description: "Event deletion",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};
exports.addGuest = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return responseHandler(res, 404, "User not found");
    }
    const { error } = validations.addGuestUserSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }
    if (!event.allowGuestRegistration) {
      return responseHandler(
        res,
        403,
        "Guest registration is disabled for this event"
      );
    }
    const newGuest = {
      ...req.body,
      addedBy: userId,
      createdAt: new Date(),
    };
    event.guests.push(newGuest);
    await event.save();

    return responseHandler(res, 200, "Guest added successfully", event);
  } catch (error) {
    console.error(error);
    return responseHandler(res, 500, "Server error");
  }
};

exports.getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: "rsvp",
        select: "name phone memberId chapter",
        populate: {
          path: "chapter",
          select: "name",
        },
      })
      .populate("attented", "name phone memberId")
      .populate("coordinator", "name phone memberId image role")
      .populate("guests.addedBy", "name ");
    const mappedData = {
      ...event._doc,
      rsvpCount: event?.rsvp?.length,
      rsvp: event?.rsvp?.map((rsvp) => {
        return {
          name: rsvp.name,
          phone: rsvp.phone,
          chaptername: rsvp.chapter.name,
        };
      }),
      guestCount: event?.guests?.length,
      guests: event?.guests?.map((g) => {
        return {
          name: g.name,
          contact: g.contact,
          category: g.category,
          addedBy: g.addedBy ? g.addedBy.name : "Unknown",
        };
      }),
      attendedCount: event?.attented?.length,
      attented: event?.attented?.map((attented) => {
        return {
          name: attented.name,
          phone: attented.phone,
          memberId: attented.memberId,
        };
      }),
    };

    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }
    return responseHandler(
      res,
      200,
      "Event retrieved successfully",
      mappedData
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate()
      .sort({ createdAt: -1, _id: 1 });

    if (!events || events.length === 0) {
      return responseHandler(res, 404, "No events found");
    }
    return responseHandler(res, 200, "Events retrieved successfully", events);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllEventsForAdmin = async (req, res) => {
  let Status = "failure";
  let errorMessage = null;
  try {
    const { pageNo = 1, status, limit = 10, search } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {};
    if (search) {
      filter.$or = [{ eventName: { $regex: search, $options: "i" } }];
    }
    if (status) {
      filter.status = status;
    }
    const events = await Event.find(filter)
      .populate("rsvp", "name phone memberId")
      .populate("coordinator", "name phone memberId image role")
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();
    const totalCount = await Event.countDocuments(filter);
    const mappedEvents = events.map((event) => {
      return {
        ...event,
        rsvpCount: event.rsvp.length,
        rsvp: event.rsvp.map((rsvp) => {
          return {
            _id: rsvp._id,
            name: rsvp.name,
            memberId: rsvp.memberId,
          };
        }),
      };
    });
    if (!events || events.length === 0) {
      return responseHandler(res, 404, "No events found");
    }

    Status = "success";

    return responseHandler(
      res,
      200,
      "Events retrieved successfully",
      mappedEvents,
      totalCount
    );
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "event",
      description: "Event list",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status: Status,
      errorMessage,
    });
  }
};
exports.addRSVP = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return responseHandler(res, 400, "Event ID is required");

    const findEvent = await Event.findById(id);
    if (!findEvent) {
      return responseHandler(res, 404, "Event not found");
    }

    if (findEvent.rsvp.includes(req.userId)) {
      return responseHandler(res, 400, "You have already RSVPed to this event");
    }

    if (findEvent.rsvp.length >= findEvent.limit) {
      return responseHandler(res, 400, "Event registration limit reached");
    }

    findEvent.rsvp.push(req.userId);

    await findEvent.save();

    const user = await User.findById(req.userId).select("fcm");

    const topic = `event_${id}`;
    const fcmToken = user.fcm;
    await getMessaging().subscribeToTopic(fcmToken, topic);

    return responseHandler(res, 200, "RSVP added successfully", {
      regCount: findEvent.regCount,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getRegEvents = async (req, res) => {
  try {
    const regEvents = await Event.find({
      rsvp: { $elemMatch: { $eq: req.userId } },
    });
    if (!regEvents || regEvents.length === 0) {
      return responseHandler(res, 404, "No events found");
    }
    return responseHandler(
      res,
      200,
      "Events retrieved successfully",
      regEvents
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.markAttendance = async (req, res) => {
  const check = req.user;
  if (check.role == "member") {
    return responseHandler(
      res,
      403,
      "You don't have permission to perform this action"
    );
  }

  const { eventId } = req.params;
  const { userId } = req.body;

  if (!eventId || !userId) {
    return responseHandler(res, 400, "Event ID and user ID are required.");
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return responseHandler(res, 404, "Event not found.");
    }

    const user = await User.findById(userId).populate({
      path: "chapter",
      populate: {
        path: "districtId",
        populate: {
          path: "zoneId",
          populate: {
            path: "stateId",
          },
        },
      },
    });

    const mappedData = {
      username: user.name,
      image: user.image,
      email: user.email,
      state: user.chapter.districtId.zoneId.stateId.name,
      zone: user.chapter.districtId.zoneId.name,
      district: user.chapter.districtId.name,
      chapter: user.chapter.name,
    };

    if (!user) {
      return responseHandler(res, 404, "User not found.");
    }

    if (event.attented.includes(userId)) {
      return responseHandler(
        res,
        400,
        "User has already been marked as attended."
      );
    }

    event.attented.push(userId);
    await event.save();

    return responseHandler(
      res,
      200,
      "Attendance marked successfully.",
      mappedData
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getAttendedUsers = async (req, res) => {
  const check = req.user;
  if (check.role == "member") {
    return responseHandler(
      res,
      403,
      "You don't have permission to perform this action"
    );
  }

  const { eventId } = req.params;

  if (!eventId) {
    return responseHandler(res, 400, "Event ID is required.");
  }

  try {
    const event = await Event.findById(eventId)
      .populate("rsvp", "name email image")
      .populate("attented", "name email image");

    const rsvpUserIds = new Set(event.rsvp.map((user) => user._id.toString()));

    const newlyReg = event.attented.filter(
      (user) => !rsvpUserIds.has(user._id.toString())
    );

    const uniqueUsersCount = newlyReg.length;

    if (!event) {
      return responseHandler(res, 404, "Event not found.");
    }

    return responseHandler(
      res,
      200,
      "Registered and Attended users retrieved successfully.",
      {
        registeredUsers: event.rsvp,
        attendedUsers: event.attented,
        uniqueUsersCount,
      }
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
exports.downloadEvents = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "organizer",
          foreignField: "_id",
          as: "organizerData",
        },
      },
      { $unwind: { path: "$organizerData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: "$eventName",
          type: 1,
          date: { $dateToString: { format: "%Y-%m-%d", date: "$eventDate" } },
          time: { $dateToString: { format: "%H:%M", date: "$startTime" } },
          location: "$venue",
          createdAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M", date: "$createdAt" },
          },
          organizerName: { $ifNull: ["$organiserName", "Unknown"] },
        },
      },
      { $sort: { createdAt: -1, _id: 1 } },
    ];

    const data = await Event.aggregate(pipeline);

    const headers = [
      { header: "Title", key: "title" },
      { header: "Type", key: "type" },
      { header: "Date", key: "date" },
      { header: "Time", key: "time" },
      { header: "Location", key: "location" },
      { header: "Organizer", key: "organizerName" },
    ];

    return responseHandler(res, 200, "Events fetched successfully", {
      headers,
      body: data,
    });
  } catch (error) {
    console.error("Download Events Error:", error);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.downloadGuests = async (req, res) => {
  try {
    const { eventId } = req.params;

    const guests = await Event.findById(eventId).populate(
      "guests.addedBy",
      "name"
    );

    const headers = [
      { header: "GuestName", key: "name" },
      { header: "Contact", key: "contact" },
      { header: "Category", key: "category" },
      { header: "C/O Member", key: "addedBy" },
    ];

    const data = guests?.guests.map((guest) => ({
      name: guest.name,
      contact: guest.contact,
      category: guest.category,
      addedBy: guest.addedBy?.name || "Unknown",
    }));

    return responseHandler(res, 200, "Guests fetched successfully", {
      headers,
      body: data,
    });
  } catch (error) {
    console.error("Download Guests Error:", error);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
exports.downloadRsvp = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate({
      path: "rsvp",
      select: "name phone chapter",
      populate: { path: "chapter", select: "name" },
    });

    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }

    const headers = [
      { header: "Name", key: "name" },
      { header: "Phone", key: "phone" },
      { header: "Chapter", key: "chapter.name" },
    ];

    const data = event.rsvp.map((user) => ({
      name: user.name,
      phone: user.phone,
      chapter: user.chapter.name,
    }));

    return responseHandler(res, 200, "RSVP fetched successfully", {
      headers,
      body: data,
    });
  } catch (error) {
    console.error("Download RSVP Error:", error);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
