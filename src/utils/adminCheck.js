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

const canUserAcceptBusiness = async (userId, analytic) => {
  if (!userId || !analytic) return false;

  const senderId = analytic.sender?._id || analytic.sender;
  if (senderId && String(senderId) === String(userId)) return false;

  const receiverId = analytic.member?._id || analytic.member;
  return Boolean(receiverId && String(receiverId) === String(userId));
};

const toId = (value) => {
  if (value == null || value === "") return "";
  if (typeof value.toHexString === "function") return value.toHexString();
  if (value._id) return toId(value._id);
  return String(value);
};

const canCoordinatorReviewBusiness = async (userId, analytic) => {
  if (!userId || !analytic) return false;
  if (String(analytic.type || "").trim() !== "Business") return false;

  const adminInfo = await isUserAdmin(userId);
  const role = String(adminInfo?.role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (role !== "b2b_coordinator") return false;

  const senderId = toId(analytic.sender?._id || analytic.sender);
  const memberId = toId(analytic.member?._id || analytic.member);
  // A coordinator may decide their own business as well as anyone else's.
  if (senderId === String(userId) || memberId === String(userId)) return true;

  const chapterIds = new Set(
    (await getScopedChapterIds(adminInfo)).map((id) => toId(id)).filter(Boolean)
  );
  const self = await User.findById(userId).select("chapter");
  const ownChapter = toId(self?.chapter);
  if (ownChapter) chapterIds.add(ownChapter);
  if (!chapterIds.size) return false;

  let chapters = [
    toId(analytic.sender?.chapter),
    toId(analytic.member?.chapter),
  ].filter(Boolean);

  if (!chapters.length) {
    const users = await User.find({
      _id: { $in: [senderId, memberId].filter(Boolean) },
    }).select("chapter");
    chapters = users.map((user) => toId(user.chapter)).filter(Boolean);
  }

  return chapters.some((chapterId) => chapterIds.has(chapterId));
};

module.exports = {
  isUserAdmin,
  getScopedChapterIds,
  canUserAcceptBusiness,
  canCoordinatorReviewBusiness,
  hierarchyRoleLabel,
};
