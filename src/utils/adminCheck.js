const Chapter = require("../models/chapterModel");
const District = require("../models/districtModel");
const State = require("../models/stateModel");
const Zone = require("../models/zoneModel");

const isUserAdmin = async (userId) => {
  try {
    const stateAdmin = await State.findOne({ admins: userId }).select("name");
    if (stateAdmin) {
      return { type: "State Admin", name: stateAdmin.name };
    }

    const zoneAdmin = await Zone.findOne({ admins: userId }).select("name");
    if (zoneAdmin) {
      return { type: "Zone Admin", name: zoneAdmin.name };
    }

    const districtAdmin = await District.findOne({ admins: userId }).select(
      "name"
    );
    if (districtAdmin) {
      return { type: "District Admin", name: districtAdmin.name };
    }

    const chapterAdmin = await Chapter.findOne({ admins: userId }).select(
      "name"
    );
    if (chapterAdmin) {
      return { type: "Chapter Admin", name: chapterAdmin.name };
    }

    return null;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return null;
  }
};

module.exports = { isUserAdmin };
