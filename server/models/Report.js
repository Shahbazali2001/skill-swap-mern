const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "Inappropriate Behavior",
        "Spam / Scam",
        "Harassment",
        "Did Not Show Up",
        "Off-topic Content",
        "Other",
      ],
      required: true,
    },
    details: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "investigating", "resolved", "dismissed"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    actionTaken: {
      type: String,
      enum: [
        "none",
        "warning_sent",
        "user_suspended",
        "user_banned",
        "content_removed",
      ],
      default: "none",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

ReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Report", ReportSchema);
