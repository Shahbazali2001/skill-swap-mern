const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SkillLevelEnum = ["Beginner", "Intermediate", "Advanced", "Expert"];

// A skill a user teaches, with an expertise level (FR3)
const TaughtSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    level: { type: String, enum: SkillLevelEnum, default: "Intermediate" },
  },
  { _id: false },
);

// A skill a user wants to learn (FR3)
const LearntSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },

    // FR2: Profile Management
    bio: { type: String, default: "", maxlength: 500 },
    location: { type: String, default: "" },
    profileImageUrl: { type: String, default: "" },
    headline: { type: String, default: "", maxlength: 120 },

    // FR3: Skill Cataloging (skills attached to a profile)
    skillsToTeach: { type: [TaughtSkillSchema], default: [] },
    skillsToLearn: { type: [LearntSkillSchema], default: [] },

    // FR9: Reputation & Trust Score Algorithm
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    trustTier: {
      type: String,
      enum: [
        "New Swapper",
        "Verified Member",
        "Trusted Partner",
        "Master Swapper",
      ],
      default: "New Swapper",
    },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    totalSwapsCompleted: { type: Number, default: 0 },

    // FR10: Recently viewed profiles
    recentlyViewed: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],

    // FR12: Moderation & Administration
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, default: "" },

    // FR1: Password reset & email verification
    isVerified: { type: Boolean, default: true },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    emailVerificationToken: { type: String, default: null },
  },
  { timestamps: true },
);

UserSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.emailVerificationToken;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
module.exports.SkillLevelEnum = SkillLevelEnum;
