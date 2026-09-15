const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  const Event = require('./models/eventModel');
  const now = new Date();
  const events = await Event.find().sort({ _id: -1 }).limit(5);
  console.log(`Found ${events.length} recent events`);
  events.forEach(event => {
    console.log("eventName:", event.eventName);
    console.log("startDate:", event.startDate);
    console.log("startTime:", event.startTime);
    console.log("endDate:", event.endDate);
    console.log("endTime:", event.endTime);
    console.log("status:", event.status);
    console.log("createdAt:", event._id.getTimestamp());
    console.log("---");
  });
  process.exit(0);
}
run();
