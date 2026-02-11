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

    let users;

    if (req.body.isAllUsers) {
      users = await User.find({ status: "active" }).select("fcm");
    } else {
      users = await User.find({
        status: "active",
        chapter: { $in: req.body.chapters },
      }).select("fcm");
    }
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
exports.editGuest = async (req, res) => {
  let status = "failure";
  let errorMessage = null;

  try {
    const { error } = validations.editGuestUserSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }
    const guest = event.guests.id(req.params.guestId);
    if (!guest) {
      return responseHandler(res, 404, "Guest not found");
    }
    if (String(guest.addedBy) !== String(req.userId)) {
      return responseHandler(res, 403, "You are not allowed to edit this guest");
    }
    Object.assign(guest, req.body, {
      createdAt: new Date(),
      addedBy: req.userId,
    });
    await event.save();
    status = "success";
    return responseHandler(res, 200, "Guest updated successfully", guest);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "event",
      description: "Guest update",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};
exports.deleteGuest = async (req, res) => {
  let status = "failure";
  let errorMessage = null;
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }
    const guest = event.guests.id(req.params.guestId);
    if (!guest) {
      return responseHandler(res, 404, "Guest not found");
    }
    if (String(guest.addedBy) !== String(req.userId)) {
      return responseHandler(res, 403, "You are not allowed to delete this guest");
    }
    guest.deleteOne();
    await event.save();
    status = "success";
    return responseHandler(res, 200, "Guest deleted successfully");
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    await logActivity.create({
      admin: req.user,
      type: "event",
      description: "Guest deletion",
      apiEndpoint: req.originalUrl,
      httpMethod: req.method,
      host: req.headers["x-forwarded-for"] || req.ip,
      agent: req.headers["user-agent"],
      status,
      errorMessage,
    });
  }
};


exports.getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: "rsvp",
        select: "name phone memberId chapter",
        populate: { path: "chapter", select: "name" },
      })
      .populate({
        path: "rsvpnew.user",
        select: "name phone memberId chapter",
        populate: { path: "chapter", select: "name" },
      })
      .populate("attented", "name phone memberId")
      .populate("coordinator", "name phone memberId image role")
      .populate("guests.addedBy", "name");

    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }

    // Map old RSVPs
    const oldRsvp = (event.rsvp || []).map(user => ({
      name: user.name || "Unknown",
      phone: user.phone || "-",
      chaptername: user.chapter?.name || "-",
      registeredDate: "unknown", // old RSVPs have no registered date
    }));

    // Map new RSVPs
    const newRsvp = (event.rsvpnew || []).map(rsvp => ({
      name: rsvp.user?.name || "Unknown",
      phone: rsvp.user?.phone || "-",
      chaptername: rsvp.user?.chapter?.name || "-",
      registeredDate: rsvp.registeredDate
        ? new Date(rsvp.registeredDate).toLocaleString()
        : "unknown",
    }));
    const mergedRsvp = [...oldRsvp, ...newRsvp]
    const mappedData = {
      ...event._doc,
      rsvpCount: mergedRsvp.length,
      rsvp: mergedRsvp,
      guestCount: event?.guests?.length,
      guests: event?.guests?.map(g => ({
        name: g.name,
        contact: g.contact,
        category: g.category,
        addedBy: g.addedBy ? g.addedBy.name : "Unknown",
        registrationDate: g.createdAt
          ? new Date(g.createdAt).toLocaleString()
          : "Unknown",
      })),
      attendedCount: event?.attented?.length,
      attented: event?.attented?.map(a => ({
        name: a.name,
        phone: a.phone,
        memberId: a.memberId,
      })),
    };

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
    const userData = await User.findById(req.userId).select("chapter");
    if (!findEvent.isAllUsers) {
      const allowed = findEvent.chapters?.some(
        (c) => c.toString() === userData.chapter.toString()
      );
      if (!allowed) {
        return responseHandler(
          res,
          403,
          "This event is not available for your chapter"
        );
      }
    }
    const alreadyRSVP = findEvent.rsvpnew.some(
      (rsvp) => rsvp.user.toString() === req.userId.toString()
    );

    if (alreadyRSVP) {
      return responseHandler(res, 400, "You have already RSVPed to this event");
    }

    if (findEvent.rsvpnew.length >= findEvent.limit) {
      return responseHandler(res, 400, "Event registration limit reached");
    }

    findEvent.rsvpnew.push({ user: req.userId, registeredDate: new Date() });

    await findEvent.save();

    const user = await User.findById(req.userId).select("fcm");

    const topic = `event_${id}`;
    const fcmToken = user.fcm;
    await getMessaging().subscribeToTopic(fcmToken, topic);

    return responseHandler(res, 200, "RSVP added successfully", {
      regCount: findEvent.rsvpnew.length,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getrsvp = async (req, res) => {
  try {
    const { eventId } = req.params;
    let { pageNo = 1, limit = 10, chapterId = null } = req.query;


    pageNo = Number(pageNo);
    limit = Number(limit);

    const skipCount = (pageNo - 1) * limit;

    const event = await Event.findById(eventId)
      .populate({
        path: "rsvp",
        select: "name phone memberId chapter",
        populate: { path: "chapter", select: "name" },
      })
      .populate({
        path: "rsvpnew.user",
        select: "name phone memberId chapter",
        populate: { path: "chapter", select: "name" },
      });

    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }

    const oldRsvp = (event.rsvp || []).map((user) => ({
      _id: user._id,
      name: user.name || "Unknown",
      phone: user.phone || "-",
      chapterId: user?.chapter?._id || null,
      chaptername: user.chapter?.name || "-",
      registeredDate: "unknown",
    }));

    const newRsvp = (event.rsvpnew || []).map((rsvp) => ({
      _id: rsvp.user?._id,
      name: rsvp.user?.name || "Unknown",
      phone: rsvp.user?.phone || "-",
      chapterId: rsvp?.user?.chapter?._id || null,
      chaptername: rsvp.user?.chapter?.name || "-",
      registeredDate: rsvp.registeredDate
        ? new Date(rsvp.registeredDate).toLocaleString()
        : "unknown",
    }));

    let mergedRsvp = [...oldRsvp, ...newRsvp];

    if (typeof chapterId === "string" && chapterId.trim()) {
      mergedRsvp = mergedRsvp.filter(
        r => r?.chapterId?.toString() === chapterId.toString()
      );
    }

    const totalCount = mergedRsvp.length;

    const paginatedRsvp = mergedRsvp.slice(skipCount, skipCount + limit);

    return responseHandler(
      res,
      200,
      "RSVP retrieved successfully",
      paginatedRsvp,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.removeRsvp = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return responseHandler(res, 400, "User ID is required");
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }

    if (req.role === "user") {

      const isCoordinator = event.coordinator.some(
        (c) => c.toString() === req.userId
      );

      if (!isCoordinator) {
        return responseHandler(
          res,
          403,
          "You are not authorized to remove RSVP for this event"
        );
      }
    }

    event.rsvp = event.rsvp.filter((id) => id.toString() !== userId);

    event.rsvpnew = event.rsvpnew.filter((rsvp) => rsvp.user.toString() !== userId);

    await event.save();

    return responseHandler(res, 200, "RSVP removed successfully");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};


exports.getRegEvents = async (req, res) => {
  try {
    const regEvents = await Event.find({
      $or: [
        { rsvp: req.userId },
        { "rsvpnew.user": req.userId }
      ]
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


    if (!event.isAllUsers) {
      const allowed = event.chapters?.some(
        (c) => c.toString() === user.chapter._id.toString()
      );
      if (!allowed) {
        return responseHandler(
          res,
          403,
          "User does not belong to this event chapter"
        );
      }
    }
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
      .populate({
        path: "rsvpnew.user",
        select: "name email image chapter",
        populate: { path: "chapter", select: "name" },
      })
      .populate({
        path: "attented",
        select: "name email image chapter",
        populate: { path: "chapter", select: "name" },
      });
    const oldRegs = event.rsvp || [];
    const newRegs = (event.rsvpnew || []).map(r => r.user);
    const registeredUsers = [...oldRegs, ...newRegs];

    const rsvpUserIds = new Set(registeredUsers.map(u => u._id.toString()));
    const newlyReg = (event.attented || []).filter(
      u => !rsvpUserIds.has(u._id.toString())
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
        registeredUsers,
        attendedUsers: event.attented || [],
        uniqueUsersCount,
      }
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
exports.getAttendedUsersList = async (req, res) => {
  try {
    const { eventId } = req.params;
    let { pageNo = 1, limit = 10, chapterId = null } = req.query;

    pageNo = Number(pageNo);
    limit = Number(limit);
    const skipCount = (pageNo - 1) * limit;

    const event = await Event.findById(eventId).populate({
      path: "attented",
      select: "name phone memberId chapter",
      populate: { path: "chapter", select: "name" },
    });

    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }

    let attendedUsers = (event.attented || []).map((user) => ({
      _id: user._id,
      name: user.name || "Unknown",
      phone: user.phone || "-",
      chapterId: user?.chapter?._id || null,
      chaptername: user.chapter?.name || "-",
    }));

    if (typeof chapterId === "string" && chapterId.trim()) {
      attendedUsers = attendedUsers.filter(
        u => u?.chapterId?.toString() === chapterId.toString()
      );
    }

    const totalCount = attendedUsers.length;
    const paginatedUsers = attendedUsers.slice(skipCount, skipCount + limit);

    return responseHandler(
      res,
      200,
      "Attended users retrieved successfully",
      paginatedUsers,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
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
      { header: "Registration Date", key: "registrationDate" },
    ];

    const data = guests?.guests.map((guest) => ({
      name: guest.name,
      contact: guest.contact,
      category: guest.category,
      addedBy: guest.addedBy?.name || "Unknown",
      registrationDate: guest.createdAt
        ? new Date(guest.createdAt).toLocaleString()
        : "-",
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

    let { chapterId = null } = req.query;
    const event = await Event.findById(eventId)
      .populate({
        path: "rsvp",
        select: "name phone chapter",
        populate: { path: "chapter", select: "name" },
      })
      .populate({
        path: "rsvpnew.user",
        select: "name phone chapter",
        populate: { path: "chapter", select: "name" },
      });

    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }

    const headers = [
      { header: "Name", key: "name" },
      { header: "Phone", key: "phone" },
      { header: "Chapter", key: "chaptername" },
      { header: "Registration Date", key: "registeredDate" },
    ];

    const oldRsvp = (event.rsvp || []).map(user => ({
      name: user.name || "-",
      phone: user.phone || "-",
      chapterId: user?.chapter?._id || null,
      chaptername: user.chapter?.name || "-",
      registeredDate: "unknown",
    }));
    const newRsvp = (event.rsvpnew || []).map(rsvp => ({
      name: rsvp.user?.name || "-",
      phone: rsvp.user?.phone || "-",
      chapterId: rsvp?.user?.chapter?._id || null,
      chaptername: rsvp.user?.chapter?.name || "-",
      registeredDate: rsvp.registeredDate
        ? new Date(rsvp.registeredDate).toLocaleString()
        : "unknown",
    }));
    let body = [...oldRsvp, ...newRsvp];
    if (typeof chapterId === "string" && chapterId.trim()) {
      body = body.filter(
        r => r?.chapterId?.toString() === chapterId.toString()
      );
    }
    body.sort((a, b) => {
      const chapterA = (a.chaptername || "").toLowerCase();
      const chapterB = (b.chaptername || "").toLowerCase();
      return chapterA.localeCompare(chapterB);
    });

    const totalSeats = event.limit || 0;
    const registeredCount = body.length;
    const balanceSeats = totalSeats - registeredCount;

    return responseHandler(res, 200, "RSVPs fetched successfully", {
      headers,
      body,
      totalSeats,
      registeredCount,
      balanceSeats
    });
  } catch (error) {
    console.error("Download RSVP Error:", error);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
exports.downloadAttendedUsers = async (req, res) => {
  try {
    const { eventId } = req.params;
    let { chapterId = null } = req.query;

    const event = await Event.findById(eventId).populate({
      path: "attented",
      select: "name phone chapter",
      populate: { path: "chapter", select: "name" },
    });

    if (!event) {
      return responseHandler(res, 404, "Event not found");
    }

    const headers = [
      { header: "Name", key: "name" },
      { header: "Phone", key: "phone" },
      { header: "Chapter", key: "chaptername" },
    ];

    let body = (event.attented || []).map(user => ({
      name: user.name || "-",
      phone: user.phone || "-",
      chapterId: user?.chapter?._id || null,
      chaptername: user.chapter?.name || "-",
    }));

    if (typeof chapterId === "string" && chapterId.trim()) {
      body = body.filter(
        r => r?.chapterId?.toString() === chapterId.toString()
      );
    }

    body.sort((a, b) => {
      const chapterA = (a.chaptername || "").toLowerCase();
      const chapterB = (b.chaptername || "").toLowerCase();
      return chapterA.localeCompare(chapterB);
    });

    const attendedCount = body.length;
    const totalSeats = event.limit || 0;

    return responseHandler(res, 200, "Attended users fetched successfully", {
      headers,
      body,
      attendedCount,
      totalSeats,
    });
  } catch (error) {
    console.error("Download Attended Users Error:", error);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
