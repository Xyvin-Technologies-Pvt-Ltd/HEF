const mongoose = require("mongoose");

const levelRoleUploadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["document", "report"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String },
    s3Key: { type: String },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["president", "secretary", "treasurer"],
      required: true,
    },
    levelType: {
      type: String,
      enum: ["state", "zone", "district", "chapter"],
      required: true,
    },
    levelId: { type: mongoose.Schema.Types.ObjectId, required: true },
    levelName: { type: String, required: true },
  },
  { timestamps: true }
);

const LevelRoleUpload = mongoose.model("LevelRoleUpload", levelRoleUploadSchema);

module.exports = LevelRoleUpload;
