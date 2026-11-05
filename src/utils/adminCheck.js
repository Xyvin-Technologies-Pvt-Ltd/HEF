const Chapter = require("../models/chapterModel");
const District = require("../models/districtModel");
const State = require("../models/stateModel");
const Zone = require("../models/zoneModel");
const User = require("../models/userModel");

const HIERARCHY_ROLE_LABELS = {
  president: "President",
  secretary: "Secretary",
  treasurer: "Treasurer",
  b2b_coordinator: "B2B Coordinator",
};

const hierarchyRoleLabel = (role) =>
  HIERARCHY_ROLE_LABELS[role] ||
  (role ? role.charAt(0).toUpperCase() + role.slice(1) : "Admin");

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

const getScopedChapterIds = async (adminInfo) => {
  if (!adminInfo) return [];

  if (adminInfo.type === "Chapter Admin") {
    return [adminInfo.id];
  }

  if (adminInfo.type === "District Admin") {
    const chapters = await Chapter.find({ districtId: adminInfo.id }).select("_id");
    return chapters.map((chapter) => chapter._id);
  }

  if (adminInfo.type === "Zone Admin") {
    const districts = await District.find({ zoneId: adminInfo.id }).select("_id");
    const chapters = await Chapter.find({
      districtId: { $in: districts.map((district) => district._id) },
    }).select("_id");
    return chapters.map((chapter) => chapter._id);
  }

  if (adminInfo.type === "State Admin") {
    const zones = await Zone.find({ stateId: adminInfo.id }).select("_id");
    const districts = await District.find({
      zoneId: { $in: zones.map((zone) => zone._id) },
    }).select("_id");
    const chapters = await Chapter.find({
      districtId: { $in: districts.map((district) => district._id) },
    }).select("_id");
    return chapters.map((chapter) => chapter._id);
  }

  return [];
};

const isChapterInAdminScope = async (adminInfo, chapterId) => {
  if (!adminInfo || !chapterId) return false;
  if (adminInfo.type === "Chapter Admin") {
    return String(adminInfo.id) === String(chapterId);
  }

  const chapter = await Chapter.findById(chapterId).select("districtId");
  if (!chapter) return false;
  if (adminInfo.type === "District Admin") {
    return String(chapter.districtId) === String(adminInfo.id);
  }

  const district = await District.findById(chapter.districtId).select("zoneId");
  if (!district) return false;
  if (adminInfo.type === "Zone Admin") {
    return String(district.zoneId) === String(adminInfo.id);
  }

  const zone = await Zone.findById(district.zoneId).select("stateId");
  if (!zone) return false;
  return String(zone.stateId) === String(adminInfo.id);
};

const canUserAcceptBusiness = async (userId, analytic) => {
  if (!userId || !analytic) return false;

  const senderId = analytic.sender?._id || analytic.sender;
  if (senderId && String(senderId) === String(userId)) return false;

  const receiverId = analytic.member?._id || analytic.member;
  if (receiverId && String(receiverId) === String(userId)) return true;

  const adminInfo = await isUserAdmin(userId);
  if (!adminInfo || adminInfo.role !== "b2b_coordinator") return false;

  let receiverChapter = analytic.member?.chapter?._id || analytic.member?.chapter;
  if (!receiverChapter && receiverId) {
    const receiver = await User.findById(receiverId).select("chapter");
    receiverChapter = receiver?.chapter;
  }

  return isChapterInAdminScope(adminInfo, receiverChapter);
};

module.exports = {
  isUserAdmin,
  getScopedChapterIds,
  canUserAcceptBusiness,
  hierarchyRoleLabel,
};
