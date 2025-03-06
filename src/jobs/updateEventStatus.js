const cron = require("node-cron");
const moment = require("moment-timezone");
const Event = require("../models/eventModel");
const { getMessaging } = require("firebase-admin/messaging");
const Notification = require("../models/notificationModel");
require("dotenv").config();

cron.schedule("* * * * *", async () => {
  const now = moment().tz("Asia/Kolkata");

  try {
    //* Update events from "pending" to "live" and send notification
    const progressEvents = await Event.find({
      status: "pending",
      startTime: { $lte: now.toDate() },
    });

    for (const event of progressEvents) {
      event.status = "live";
      await event.save();
      const data = event.rsvp.map((rsvp) => ({
        user: rsvp._id,
        read: false,
      }));
      await Notification.create({
        users: data,
        subject: `Event ${event.eventName} is now live!`,
        content: `The event ${event.eventName} has started. Join now!`,
        link: event.type === "Online" ? event.link : event.venue,
        type: "in-app",
        senderModel: "Cronjob",
      });

      const topic = `event_${event._id}`;

      const message = {
        notification: {
          title: `Event ${event.eventName} is now live!`,
          body: `The event ${event.eventName} has started. Join now!`,
        },
        android: {
          notification: {
            imageUrl: event.image,
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1,
            },
          },
          fcm_options: {
            image: event.image,
          },
        },
        topic: topic,
        data: {
          screen: "event",
          id: event._id.toString(),
        },
      };

      try {
        await getMessaging().send(message);
        console.log(`Notification sent for event ${event.eventName}`);
      } catch (err) {
        console.error(
          `Failed to send notification for event ${event.eventName}:`,
          err
        );
      }
    }

    console.log(`Updated ${progressEvents.length} events to live`);

    //* Update events from "live" to "completed" and send notification
    const doneEvents = await Event.find({
      status: "live",
      endDate: { $lte: now.toDate() },
    });

    for (const event of doneEvents) {
      event.status = "completed";
      await event.save();
      const data = event.rsvp.map((rsvp) => ({
        user: rsvp._id,
        read: false,
      }));
      await Notification.create({
        users: data,
        subject: `Event ${event.eventName} is now completed!`,
        content: `The event ${event.eventName} has ended. Thank you for participating!`,
        type: "in-app",
        senderModel: "Cronjob",
      });

      const topic = `event_${event._id}`;
      const message = {
        notification: {
          title: `Event ${event.eventName} is now completed!`,
          body: `The event ${event.eventName} has ended. Thank you for participating!`,
        },
        android: {
          notification: {
            imageUrl: event.image,
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1,
            },
          },
          fcm_options: {
            image: event.image,
          },
        },
        topic: topic,
        data: {
          screen: "event",
          id: event._id.toString(),
        },
      };

      try {
        await getMessaging().send(message);
        console.log(`Notification sent for completed event ${event.eventName}`);
      } catch (err) {
        console.error(
          `Failed to send notification for event ${event.eventName}:`,
          err
        );
      }
    }

    console.log(`Updated ${doneEvents.length} events to completed`);
  } catch (err) {
    console.error("Error updating events:", err);
  }
});
