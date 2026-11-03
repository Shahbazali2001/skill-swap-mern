const Report = require("../models/Report");
const User = require("../models/User");

// POST /api/v1/reports -> submit a moderation report (FR12)
exports.submitReport = async (req, res) => {
  try {
    const { reportedUserId, reason, details } = req.body;

    if (!reportedUserId || !reason || !details) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION",
          message: "reportedUserId, reason, and details are required",
        },
      });
    }

    if (reportedUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION", message: "You cannot report yourself" },
      });
    }

    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Reported user not found" },
        });
    }

    const report = await Report.create({
      reporter: req.user.id,
      reportedUser: reportedUserId,
      reason,
      details: details.trim(),
      status: "pending",
    });

    const populated = await report.populate([
      { path: "reporter", select: "name email" },
      { path: "reportedUser", select: "name email location" },
    ]);

    res.status(201).json({
      success: true,
      data: {
        message:
          "Report submitted successfully. Our administrative team will review it shortly.",
        report: populated,
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
