const mongoose = require("mongoose");

const CATEGORIES = [
  "IT",
  "Arts",
  "Music",
  "Cooking",
  "Languages",
  "Business",
  "Sports",
  "Other",
];

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

SkillSchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Skill", SkillSchema);
module.exports.CATEGORIES = CATEGORIES;
