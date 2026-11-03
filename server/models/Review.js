const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    tags: [
      {
        type: String,
        enum: [
          "Punctual",
          "Knowledgeable",
          "Patient Teacher",
          "Great Communicator",
          "Friendly",
          "Well Prepared",
          "Structured Lessons",
          "Fun Experience",
        ],
      },
    ],
    skillTaught: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    },
  },
  { timestamps: true },
);

// One review per user per swap
ReviewSchema.index({ swapRequest: 1, reviewer: 1 }, { unique: true });
ReviewSchema.index({ reviewee: 1, createdAt: -1 });

module.exports = mongoose.model("Review", ReviewSchema);
