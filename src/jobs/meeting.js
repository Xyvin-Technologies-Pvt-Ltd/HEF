const cron = require("node-cron");
const moment = require("moment-timezone");
const Notification = require("../models/notificationModel");
const sendInAppNotification = require("../utils/sendInAppNotification");
const Analytic = require("../models/analyticModel");
require("dotenv").config();

cron.schedule("0 0 * * *", async () => {
  const now = moment().tz("Asia/Kolkata");

  try {
    const expiring = await Analytic.find({
      status: "meeting_scheduled",
      date: { $gte: now.toDate() },
    }).populate("member");

    for (const exp of expiring) {
      const data = {
        user: exp.member._id,
        read: false,
      };
      await Notification.create({
        users: data,
        subject: `Meeting is expired`,
        content: `Meeting is expired. Please finish the meeting or reject the meeting.`,
        type: "in-app",
        senderModel: "Cronjob",
      });

      await sendInAppNotification(
        [exp.member.fcmToken],
        "Meeting Expired",
        `Meeting is expired. Please finish the meeting or reject the meeting.`
      );
    }
  } catch (err) {
    console.error("Error updating subscriptions:", err);
  }
});
