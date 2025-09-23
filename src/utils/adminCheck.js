const Chapter = require("../models/chapterModel");
const District = require("../models/districtModel");
const State = require("../models/stateModel");
const Zone = require("../models/zoneModel");

const isUserAdmin = async (userId) => {
  try {
    const stateAdmin = await State.findOne({
      "admins.user": userId,
    }).select("name admins");
    if (stateAdmin) {
      const adminEntry = stateAdmin.admins.find(a => a.user.toString() === userId.toString());
      return { type: "State Admin", name: stateAdmin.name, id: stateAdmin._id, role: adminEntry?.role || null };
    }

    const zoneAdmin = await Zone.findOne({
      "admins.user": userId,
    }).select("name admins");
    if (zoneAdmin) {
      const adminEntry = zoneAdmin.admins.find(a => a.user.toString() === userId.toString());
      return { type: "Zone Admin", name: zoneAdmin.name, id: zoneAdmin._id, role: adminEntry?.role || null };
    }

    const districtAdmin = await District.findOne({
      "admins.user": userId,
    }).select("name admins");
    if (districtAdmin) {
      const adminEntry = districtAdmin.admins.find(a => a.user.toString() === userId.toString());
      return { type: "District Admin", name: districtAdmin.name, id: districtAdmin._id, role: adminEntry?.role || null };
    }

    const chapterAdmin = await Chapter.findOne({
      "admins.user": userId,
    }).select("name admins");
    if (chapterAdmin) {
      const adminEntry = chapterAdmin.admins.find(a => a.user.toString() === userId.toString());
      return {
        type: "Chapter Admin", name: chapterAdmin.name, id: chapterAdmin._id, role: adminEntry?.role || null
      };
    }

    return null;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return null;
  }
};

module.exports = { isUserAdmin };
