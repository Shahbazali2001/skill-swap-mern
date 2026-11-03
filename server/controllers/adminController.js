const User = require("../models/User");
const Skill = require("../models/Skill");
const SwapRequest = require("../models/SwapRequest");
const Review = require("../models/Review");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const { calculateTrustScore } = require("../services/trustScoreService");

// GET /api/v1/admin/stats -> overall platform overview (FR12)
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      suspendedUsers,
      totalSkills,
      totalSwaps,
      pendingSwaps,
      acceptedSwaps,
      completedSwaps,
      totalReviews,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isSuspended: true }),
      Skill.countDocuments(),
      SwapRequest.countDocuments(),
      SwapRequest.countDocuments({ status: "pending" }),
      SwapRequest.countDocuments({ status: "accepted" }),
      SwapRequest.countDocuments({ status: "completed" }),
      Review.countDocuments(),
      Report.countDocuments({ status: "pending" }),
    ]);

    // Skill distribution by category
    const categoryStats = await Skill.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent activity overview
    const recentUsers = await User.find()
      .select("name email role trustScore trustTier createdAt isSuspended")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentReports = await Report.find()
      .populate("reporter", "name email")
      .populate("reportedUser", "name email isSuspended")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          activeUsers: totalUsers - suspendedUsers,
          suspendedUsers,
          totalSkills,
          totalSwaps,
          pendingSwaps,
          acceptedSwaps,
          completedSwaps,
          totalReviews,
          pendingReports,
        },
        categoryStats,
        recentUsers,
        recentReports,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// GET /api/v1/admin/users -> list users with filters & moderation status (FR12)
exports.listUsers = async (req, res) => {
  try {
    const { q, role, isSuspended } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
        { location: { $regex: q.trim(), $options: "i" } },
      ];
    }

    if (role) filter.role = role;
    if (isSuspended !== undefined) filter.isSuspended = isSuspended === "true";

    const users = await User.find(filter)
      .select("-passwordHash")
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { users, count: users.length } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// PATCH /api/v1/admin/users/:id/status -> moderate user account (FR12)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isSuspended, suspensionReason, role } = req.body;
    const update = {};

    if (isSuspended !== undefined) {
      update.isSuspended = isSuspended;
      update.suspensionReason = isSuspended
        ? suspensionReason || "Administrative suspension"
        : "";
    }
    if (role && ["user", "admin"].includes(role)) {
      update.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
      .select("-passwordHash")
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill");

    if (!user)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });

    // Send in-app notification if suspended/unsuspended
    if (isSuspended !== undefined) {
      await Notification.create({
        recipient: user._id,
        sender: req.user.id,
        type: "system_alert",
        title: isSuspended ? "Account Suspended" : "Account Re-activated",
        message: isSuspended
          ? `Your account was suspended: ${update.suspensionReason}`
          : "Your SkillSwap account privileges have been restored.",
        link: "/dashboard",
      });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// DELETE /api/v1/admin/users/:id -> delete user account (FR12)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });

    // Cleanup user swaps and reviews
    await Promise.all([
      SwapRequest.deleteMany({
        $or: [{ requester: user._id }, { receiver: user._id }],
      }),
      Review.deleteMany({
        $or: [{ reviewer: user._id }, { reviewee: user._id }],
      }),
      Notification.deleteMany({ recipient: user._id }),
    ]);

    res.json({ success: true, data: { message: "User deleted successfully" } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// GET /api/v1/admin/skills -> skill catalog management (FR3, FR12)
exports.listSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    res.json({ success: true, data: { skills } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// POST /api/v1/admin/skills -> add skill to catalog (FR3, FR12)
exports.createSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !category) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message: "Name and category are required",
          },
        });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category,
      description: description || "",
    });
    res.status(201).json({ success: true, data: { skill } });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({
          success: false,
          error: {
            code: "DUPLICATE",
            message: "Skill already exists in that category",
          },
        });
    }
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// PUT /api/v1/admin/skills/:id -> edit skill in catalog (FR3, FR12)
exports.updateSkill = async (req, res) => {
  try {
    const { name, category, description, isActive } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (category) update.category = category;
    if (description !== undefined) update.description = description;
    if (isActive !== undefined) update.isActive = isActive;

    const skill = await Skill.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!skill)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Skill not found" },
        });

    res.json({ success: true, data: { skill } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// DELETE /api/v1/admin/skills/:id -> delete skill from catalog (FR3, FR12)
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Skill not found" },
        });
    res.json({
      success: true,
      data: { message: "Skill deleted from catalog" },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// GET /api/v1/admin/reports -> moderation queue (FR12)
exports.listReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const reports = await Report.find(filter)
      .populate("reporter", "name email profileImageUrl")
      .populate(
        "reportedUser",
        "name email profileImageUrl isSuspended trustScore",
      )
      .populate("resolvedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { reports, count: reports.length } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// PATCH /api/v1/admin/reports/:id -> resolve / action on report (FR12)
exports.updateReport = async (req, res) => {
  try {
    const { status, adminNotes, actionTaken } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Report not found" },
        });

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    if (actionTaken) report.actionTaken = actionTaken;

    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();

    // If action taken is user suspension, suspend reported user immediately
    if (actionTaken === "user_suspended" || actionTaken === "user_banned") {
      await User.findByIdAndUpdate(report.reportedUser, {
        isSuspended: true,
        suspensionReason: `Suspended due to user report (${report.reason}): ${adminNotes || "Violation of Community Guidelines"}`,
      });
    }

    await report.save();

    const populated = await report.populate([
      { path: "reporter", select: "name email" },
      { path: "reportedUser", select: "name email isSuspended" },
      { path: "resolvedBy", select: "name" },
    ]);

    res.json({ success: true, data: { report: populated } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};
