const mongoose = require("mongoose");

const userAccessModel = mongoose.Schema(
  {
    sendNotification: { type: Boolean },
    postRequirement: { type: Boolean },
    addReward: { type: Boolean },
    addCertificate: { type: Boolean },
    addSocialmedia: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

const UserAccess = mongoose.model("UserAccess", userAccessModel);

module.exports = UserAccess;
