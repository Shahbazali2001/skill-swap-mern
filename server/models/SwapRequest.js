const mongoose = require("mongoose");

const SwapRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The skill the requester will teach, and the skill they want in return
    offeredSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    requestedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    message: { type: String, default: "", maxlength: 500 },
    scheduleNotes: { type: String, default: "", maxlength: 500 },
    completedAt: { type: Date, default: null },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

SwapRequestSchema.index({ requester: 1, receiver: 1, status: 1 });
SwapRequestSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model("SwapRequest", SwapRequestSchema);
