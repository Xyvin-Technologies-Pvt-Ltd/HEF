const Chapter = require("../models/chapterModel");
const District = require("../models/districtModel");
const State = require("../models/stateModel");
const Zone = require("../models/zoneModel");

const isUserAdmin = async (userId) => {
  try {
    const stateAdmin = await State.findOne({
      "admins.user": userId,
    }).select("name");
    if (stateAdmin) {
      return { type: "State Admin", name: stateAdmin.name, id: stateAdmin._id };
    }

    const zoneAdmin = await Zone.findOne({
      "admins.user": userId,
    }).select("name");
    if (zoneAdmin) {
      return { type: "Zone Admin", name: zoneAdmin.name, id: zoneAdmin._id };
    }

    const districtAdmin = await District.findOne({
      "admins.user": userId,
    }).select("name");
    if (districtAdmin) {
      return { type: "District Admin", name: districtAdmin.name, id: districtAdmin._id };
    }

    const chapterAdmin = await Chapter.findOne({
      "admins.user": userId,
    }).select("name");
    if (chapterAdmin) {
      return { type: "Chapter Admin", name: chapterAdmin.name, id: chapterAdmin._id };
    }

    return null;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return null;
  }
};

module.exports = { isUserAdmin };
