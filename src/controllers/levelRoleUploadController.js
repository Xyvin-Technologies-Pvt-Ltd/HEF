const responseHandler = require("../helpers/responseHandler");
const checkAccess = require("../helpers/checkAccess");
const LevelRoleUpload = require("../models/levelRoleUploadModel");
const User = require("../models/userModel");
const { isUserAdmin, hierarchyRoleLabel } = require("../utils/adminCheck");
const { uploadBufferToS3, deleteS3Object, getS3Object } = require("../utils/s3Upload");

const UPLOAD_ROLES = ["president", "secretary", "treasurer"];

const LEVEL_TYPE = {
  "State Admin": "state",
  "Zone Admin": "zone",
  "District Admin": "district",
  "Chapter Admin": "chapter",
};

const mapUpload = (item) => ({
  _id: item._id,
  type: item.type,
  title: item.title,
  description: item.description || "",
  fileUrl: item.fileUrl,
  fileName: item.fileName,
  mimeType: item.mimeType,
  uploadedBy: item.uploadedBy?._id || item.uploadedBy,
  uploadedByName: item.uploadedBy?.name || "",
  role: item.role,
  roleLabel: hierarchyRoleLabel(item.role),
  levelType: item.levelType,
  levelId: item.levelId,
  levelName: item.levelName,
  level: `${item.levelName} ${item.levelType}`,
  createdAt: item.createdAt,
});

const getUploaderContext = async (userId) => {
  const adminInfo = await isUserAdmin(userId);
  if (!adminInfo || !UPLOAD_ROLES.includes(adminInfo.role)) return null;
  const levelType = LEVEL_TYPE[adminInfo.type];
  if (!levelType) return null;
  return { adminInfo, levelType };
};

exports.createUpload = async (req, res) => {
  try {
    if (req.role !== "user") {
      return responseHandler(res, 403, "Only app users can upload");
    }

    const context = await getUploaderContext(req.userId);
    if (!context) {
      return responseHandler(
        res,
        403,
        "Only President, Secretary, and Treasurer can upload"
      );
    }

    const type = String(req.body.type || "report").toLowerCase();
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();

    if (type !== "report") {
      return responseHandler(res, 400, "Type must be report");
    }
    if (!title) {
      return responseHandler(res, 400, "Title is required");
    }
    if (!req.file) {
      return responseHandler(res, 400, "File is required");
    }

    const uploaded = await uploadBufferToS3(req.file, "level-role-uploads");
    const record = await LevelRoleUpload.create({
      type,
      title,
      description,
      fileUrl: uploaded.fileUrl,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      s3Key: uploaded.key,
      uploadedBy: req.userId,
      role: context.adminInfo.role,
      levelType: context.levelType,
      levelId: context.adminInfo.id,
      levelName: context.adminInfo.name,
    });

    const saved = await LevelRoleUpload.findById(record._id).populate(
      "uploadedBy",
      "name"
    );

    return responseHandler(res, 201, "Upload saved successfully", mapUpload(saved));
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getMyUploads = async (req, res) => {
  try {
    if (req.role !== "user") {
      return responseHandler(res, 403, "Only app users can view their uploads");
    }

    const context = await getUploaderContext(req.userId);
    if (!context) {
      return responseHandler(
        res,
        403,
        "Only President, Secretary, and Treasurer can view uploads"
      );
    }

    const { pageNo = 1, limit = 10, type } = req.query;
    const skip = Number(limit) * (Number(pageNo) - 1);
    const filter = { uploadedBy: req.userId };
    if (type) filter.type = type;

    const totalCount = await LevelRoleUpload.countDocuments(filter);
    const data = await LevelRoleUpload.find(filter)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return responseHandler(
      res,
      200,
      "Uploads fetched successfully",
      data.map(mapUpload),
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteMyUpload = async (req, res) => {
  try {
    if (req.role !== "user") {
      return responseHandler(res, 403, "Only app users can delete their uploads");
    }

    const record = await LevelRoleUpload.findById(req.params.id);
    if (!record) {
      return responseHandler(res, 404, "Upload not found");
    }
    if (String(record.uploadedBy) !== String(req.userId)) {
      return responseHandler(res, 403, "You can delete only your own upload");
    }

    await LevelRoleUpload.findByIdAndDelete(record._id);
    try {
      await deleteS3Object(record.s3Key);
    } catch (error) {
      console.error("S3 delete failed:", error.message);
    }

    return responseHandler(res, 200, "Upload deleted successfully", record);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAdminUploads = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return responseHandler(res, 403, "You don't have permission to perform this action");
    }
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("pstUploadManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const {
      pageNo = 1,
      limit = 10,
      type,
      role,
      levelType,
      search,
    } = req.query;
    const skip = Number(limit) * (Number(pageNo) - 1);
    const filter = {};

    if (type) filter.type = type;
    if (role) filter.role = role;
    if (levelType) filter.levelType = levelType;
    if (search) {
      const matchedUsers = await User.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { levelName: { $regex: search, $options: "i" } },
        { uploadedBy: { $in: matchedUsers.map((user) => user._id) } },
      ];
    }

    const totalCount = await LevelRoleUpload.countDocuments(filter);
    const data = await LevelRoleUpload.find(filter)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return responseHandler(
      res,
      200,
      "Uploads fetched successfully",
      data.map(mapUpload),
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAdminUpload = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return responseHandler(res, 403, "You don't have permission to perform this action");
    }
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("pstUploadManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const record = await LevelRoleUpload.findById(req.params.id).populate(
      "uploadedBy",
      "name phone memberId"
    );
    if (!record) {
      return responseHandler(res, 404, "Upload not found");
    }

    return responseHandler(res, 200, "Upload fetched successfully", {
      ...mapUpload(record),
      uploaderPhone: record.uploadedBy?.phone || "",
      uploaderMemberId: record.uploadedBy?.memberId || "",
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.downloadAdminUpload = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return responseHandler(res, 403, "You don't have permission to perform this action");
    }
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("pstUploadManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const record = await LevelRoleUpload.findById(req.params.id);
    if (!record) {
      return responseHandler(res, 404, "Upload not found");
    }

    const object = await getS3Object(record.s3Key);
    const fileName = String(record.fileName || "report").replace(/["\r\n]/g, "");
    res.setHeader(
      "Content-Type",
      record.mimeType || object.ContentType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
    );
    if (object.ContentLength) {
      res.setHeader("Content-Length", object.ContentLength);
    }
    object.Body.pipe(res);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteAdminUpload = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return responseHandler(res, 403, "You don't have permission to perform this action");
    }
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("pstUploadManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const record = await LevelRoleUpload.findById(req.params.id);
    if (!record) {
      return responseHandler(res, 404, "Upload not found");
    }

    await LevelRoleUpload.findByIdAndDelete(record._id);
    try {
      await deleteS3Object(record.s3Key);
    } catch (error) {
      console.error("S3 delete failed:", error.message);
    }

    return responseHandler(res, 200, "Upload deleted successfully", record);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
