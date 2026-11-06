const express = require("express");
const multer = require("multer");
const authVerify = require("../middlewares/authVerify");
const responseHandler = require("../helpers/responseHandler");
const levelRoleUploadController = require("../controllers/levelRoleUploadController");

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Upload a PDF, image, Word, or Excel file"));
  },
});

const acceptFile = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (!error) return next();
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File must be 15 MB or smaller"
        : error.message;
    return responseHandler(res, 400, message);
  });
};

const levelRoleUploadRoute = express.Router();

levelRoleUploadRoute.use(authVerify);

levelRoleUploadRoute.post("/", acceptFile, levelRoleUploadController.createUpload);
levelRoleUploadRoute.get("/admin", levelRoleUploadController.getAdminUploads);
levelRoleUploadRoute.get("/admin/:id/file", levelRoleUploadController.downloadAdminUpload);
levelRoleUploadRoute.get("/admin/:id", levelRoleUploadController.getAdminUpload);
levelRoleUploadRoute.delete("/admin/:id", levelRoleUploadController.deleteAdminUpload);
levelRoleUploadRoute.get("/", levelRoleUploadController.getMyUploads);
levelRoleUploadRoute.delete("/:id", levelRoleUploadController.deleteMyUpload);

module.exports = levelRoleUploadRoute;
