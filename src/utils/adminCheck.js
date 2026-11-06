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

const normalizedRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const toId = (value) => {
  if (value == null || value === "") return "";
  if (typeof value.toHexString === "function") return value.toHexString();
  if (value._id) return toId(value._id);
  return String(value);
};

const partyId = (party) => toId(party?._id || party);

const findCoordinatorAssignments = async (userId) => {
  const assignments = [];
  const collect = (docs, type) => {
    for (const doc of docs) {
      const entry = (doc.admins || []).find(
        (admin) =>
          admin.user &&
          String(admin.user) === String(userId) &&
          normalizedRole(admin.role) === "b2b_coordinator"
      );
      if (entry) {
        assignments.push({
          type,
          id: doc._id,
          name: doc.name,
          role: "b2b_coordinator",
        });
      }
    }
  };

  collect(await State.find({ "admins.user": userId }).select("name admins"), "State Admin");
  collect(await Zone.find({ "admins.user": userId }).select("name admins"), "Zone Admin");
  collect(
    await District.find({ "admins.user": userId }).select("name admins"),
    "District Admin"
  );
  collect(
    await Chapter.find({ "admins.user": userId }).select("name admins"),
    "Chapter Admin"
  );
  return assignments;
};

const getCoordinatorChapterIds = async (userId) => {
  const assignments = await findCoordinatorAssignments(userId);
  const ids = [];
  for (const assignment of assignments) {
    ids.push(...(await getScopedChapterIds(assignment)));
  }
  return [...new Map(ids.map((id) => [toId(id), id])).values()];
};

const chapterIdOf = async (party) => {
  const direct = party?.chapter?._id || party?.chapter;
  if (direct) return toId(direct);
  const id = partyId(party);
  if (!id) return "";
  const user = await User.findById(id).select("chapter");
  return toId(user?.chapter);
};

const canUserAcceptBusiness = async (userId, analytic) => {
  if (!userId || !analytic) return false;

  const me = toId(userId);
  if (partyId(analytic.sender) === me) return false;
  return partyId(analytic.member) === me;
};

const canCoordinatorReviewBusiness = async (userId, analytic) => {
  if (!userId || !analytic) return false;
  if (String(analytic.type || "").trim().toLowerCase() !== "business") return false;

  const assignments = await findCoordinatorAssignments(userId);
  if (!assignments.length) return false;

  const chapterIds = await getCoordinatorChapterIds(userId);
  const allowed = new Set(chapterIds.map((id) => toId(id)));
  const receiverChapter = await chapterIdOf(analytic.member);
  const senderChapter = await chapterIdOf(analytic.sender);
  return allowed.has(receiverChapter) || allowed.has(senderChapter);
};

module.exports = {
  isUserAdmin,
  getScopedChapterIds,
  getCoordinatorChapterIds,
  findCoordinatorAssignments,
  canUserAcceptBusiness,
  canCoordinatorReviewBusiness,
  hierarchyRoleLabel,
};
