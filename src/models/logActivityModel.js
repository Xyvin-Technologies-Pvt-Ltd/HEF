const mongoose = require("mongoose");

const logActivitySchema = mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Admin",
    },
    type: {
      type: String,
    },
    description: {
      type: String,
    },
    apiEndpoint: {
      type: String,
    },
    httpMethod: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
    },
    host: { type: String },
    agent: { type: String },
    
    errorMessage: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

logActivitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const logActivity = mongoose.model("AdminActivityLog", logActivitySchema);

module.exports = logActivity;
