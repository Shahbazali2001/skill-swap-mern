const jwt = require("jsonwebtoken");
const User = require("../models/User");

// FR1: verifies the JWT sent in the Authorization: Bearer <token> header
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        error: { code: "NO_TOKEN", message: "Authentication token missing" },
      });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is suspended
    const userDoc = await User.findById(payload.id).select(
      "isSuspended suspensionReason role name email",
    );
    if (!userDoc) {
      return res
        .status(401)
        .json({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User no longer exists" },
        });
    }
    if (userDoc.isSuspended) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_SUSPENDED",
          message: `Account has been suspended. Reason: ${userDoc.suspensionReason || "Violation of terms"}`,
        },
      });
    }

    req.user = {
      id: userDoc._id.toString(),
      role: userDoc.role,
      name: userDoc.name,
      email: userDoc.email,
    };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
      });
  }
}

// FR12: Admin check middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Administrator privileges required",
        },
      });
  }
  next();
}

// Same verification, but used by the Socket.io handshake (token comes from auth payload, not headers)
function verifySocketToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { requireAuth, requireAdmin, verifySocketToken };
