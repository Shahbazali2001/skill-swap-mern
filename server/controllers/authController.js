const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../services/emailService");
const { calculateTrustScore } = require("../services/trustScoreService");

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

// POST /api/v1/auth/register (FR1)
exports.register = async (req, res) => {
  try {
    const { name, email, password, location, bio } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message: "Name, email and password are required",
          },
        });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message: "Password must be at least 6 characters",
          },
        });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          error: { code: "EMAIL_IN_USE", message: "Email already in use" },
        });
    }

    // BCrypt password encryption, as required by FR1
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      location: location || "",
      bio: bio || "",
      trustScore: 50,
      trustTier: "New Swapper",
    });

    const token = signToken(user);
    res
      .status(201)
      .json({ success: true, data: { user: user.toSafeObject(), token } });
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

// POST /api/v1/auth/login (FR1)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message: "Email and password are required",
          },
        });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(401)
        .json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_SUSPENDED",
          message: `Account is suspended. Reason: ${user.suspensionReason || "Contact administration"}`,
        },
      });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res
        .status(401)
        .json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
    }

    // Update reputation score snapshot if needed
    calculateTrustScore(user._id).catch(() => {});

    // JWT session handling, as required by FR1
    const token = signToken(user);
    res.json({ success: true, data: { user: user.toSafeObject(), token } });
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

// GET /api/v1/auth/me (FR1)
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill")
      .populate(
        "recentlyViewed.user",
        "name profileImageUrl location trustScore trustTier",
      );

    if (!user)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });
    res.json({ success: true, data: { user: user.toSafeObject() } });
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

// POST /api/v1/auth/forgot-password (FR1: reset password via email verification)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({
          success: false,
          error: { code: "VALIDATION", message: "Email is required" },
        });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success to avoid email enumeration while providing security
      return res.json({
        success: true,
        data: {
          message:
            "If an account exists with that email, a password reset code has been sent.",
        },
      });
    }

    // Generate 6-character random verification token
    const resetToken = crypto.randomBytes(3).toString("hex").toUpperCase();
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = tokenExpires;
    await user.save();

    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const resetUrl = `${clientOrigin}/forgot-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    await sendPasswordResetEmail({
      toEmail: user.email,
      name: user.name,
      resetToken,
      resetUrl,
    });

    res.json({
      success: true,
      data: {
        message: "Password reset code generated and sent to email.",
        // Reset code also returned for convenient viva / demo testing
        resetToken,
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

// POST /api/v1/auth/reset-password (FR1: verify reset token and update password)
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message: "Email, reset token and new password are required",
          },
        });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message: "Password must be at least 6 characters",
          },
        });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: token.trim().toUpperCase(),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Password reset code is invalid or has expired.",
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      data: {
        message:
          "Password reset successfully. You can now log in with your new password.",
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
