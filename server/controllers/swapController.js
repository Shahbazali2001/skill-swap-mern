const SwapRequest = require("../models/SwapRequest");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Notification = require("../models/Notification");
const { sendSwapAlertEmail } = require("../services/emailService");
const { calculateTrustScore } = require("../services/trustScoreService");

// POST /api/v1/swaps -> send a swap request (FR6)
exports.sendSwapRequest = async (req, res) => {
  try {
    const {
      receiverId,
      offeredSkillId,
      requestedSkillId,
      message,
      scheduleNotes,
    } = req.body;

    if (!receiverId || !offeredSkillId || !requestedSkillId) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message:
              "receiverId, offeredSkillId and requestedSkillId are required",
          },
        });
    }
    if (receiverId === req.user.id) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message: "You cannot send a swap request to yourself",
          },
        });
    }

    const [receiver, requester, offeredSkill, requestedSkill] =
      await Promise.all([
        User.findById(receiverId),
        User.findById(req.user.id),
        Skill.findById(offeredSkillId),
        Skill.findById(requestedSkillId),
      ]);
    if (!receiver)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Receiver not found" },
        });
    if (!offeredSkill || !requestedSkill)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Skill not found" },
        });

    // Check if there is already an active or pending request for this pair
    const existingPending = await SwapRequest.findOne({
      requester: req.user.id,
      receiver: receiverId,
      status: "pending",
    });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        error: {
          code: "DUPLICATE_REQUEST",
          message: "You already have a pending swap request with this user.",
        },
      });
    }

    const swap = await SwapRequest.create({
      requester: req.user.id,
      receiver: receiverId,
      offeredSkill: offeredSkillId,
      requestedSkill: requestedSkillId,
      message: message || "",
      scheduleNotes: scheduleNotes || "",
      status: "pending",
    });

    const populated = await swap.populate([
      { path: "requester", select: "-passwordHash" },
      { path: "receiver", select: "-passwordHash" },
      { path: "offeredSkill" },
      { path: "requestedSkill" },
    ]);

    // Create persistent in-app notification (FR11)
    const notification = await Notification.create({
      recipient: receiverId,
      sender: req.user.id,
      type: "swap_request",
      title: "New Swap Request",
      message: `${requester.name} wants to swap ${offeredSkill.name} for ${requestedSkill.name}`,
      link: "/swaps",
      metadata: { swapId: swap._id },
    });

    // Push notification to socket room (FR11 + FR7)
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${receiverId}`).emit("swap:new_request", populated);
      io.to(`user:${receiverId}`).emit("notification:new", notification);
    }

    // Email alert (FR11)
    sendSwapAlertEmail({
      toEmail: receiver.email,
      recipientName: receiver.name,
      requesterName: requester.name,
      offeredSkill: offeredSkill.name,
      requestedSkill: requestedSkill.name,
    }).catch(console.error);

    res.status(201).json({ success: true, data: { swap: populated } });
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

// GET /api/v1/swaps -> list current user's swap requests (sent + received)
exports.listSwapRequests = async (req, res) => {
  try {
    const swaps = await SwapRequest.find({
      $or: [{ requester: req.user.id }, { receiver: req.user.id }],
    })
      .populate("requester", "-passwordHash")
      .populate("receiver", "-passwordHash")
      .populate("offeredSkill")
      .populate("requestedSkill")
      .sort({ updatedAt: -1, createdAt: -1 });

    res.json({ success: true, data: { swaps } });
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

// GET /api/v1/swaps/:id -> get single swap details
exports.getSwapById = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate("requester", "-passwordHash")
      .populate("receiver", "-passwordHash")
      .populate("offeredSkill")
      .populate("requestedSkill");

    if (!swap)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Swap request not found" },
        });

    const isParty =
      String(swap.requester._id) === req.user.id ||
      String(swap.receiver._id) === req.user.id;
    if (!isParty && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to view this swap",
          },
        });
    }

    res.json({ success: true, data: { swap } });
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

// PATCH /api/v1/swaps/:id -> accept / reject / cancel / complete (FR6 state machine)
exports.updateSwapStatus = async (req, res) => {
  try {
    const { status, scheduleNotes } = req.body;
    const allowed = ["accepted", "rejected", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message: `Status must be one of ${allowed.join(", ")}`,
          },
        });
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Swap request not found" },
        });

    const isReceiver = String(swap.receiver) === req.user.id;
    const isRequester = String(swap.requester) === req.user.id;
    if (!isReceiver && !isRequester && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not part of this swap request",
          },
        });
    }

    // Rules for state transitions
    if (status === "accepted" || status === "rejected") {
      if (!isReceiver && req.user.role !== "admin") {
        return res
          .status(403)
          .json({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Only the receiver can accept or reject this request",
            },
          });
      }
      if (swap.status !== "pending") {
        return res
          .status(400)
          .json({
            success: false,
            error: {
              code: "INVALID_STATE",
              message: `Cannot ${status} a request that is ${swap.status}`,
            },
          });
      }
    }

    if (status === "cancelled") {
      if (swap.status !== "pending") {
        return res
          .status(400)
          .json({
            success: false,
            error: {
              code: "INVALID_STATE",
              message: "Only pending requests can be cancelled",
            },
          });
      }
    }

    if (status === "completed") {
      if (swap.status !== "accepted") {
        return res
          .status(400)
          .json({
            success: false,
            error: {
              code: "INVALID_STATE",
              message: "Only accepted swaps can be marked completed",
            },
          });
      }
      swap.completedAt = new Date();
      swap.completedBy = req.user.id;
    }

    if (scheduleNotes) {
      swap.scheduleNotes = scheduleNotes;
    }

    swap.status = status;
    await swap.save();

    let conversation = null;
    if (status === "accepted") {
      conversation = await Conversation.findOne({ swapRequest: swap._id });
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [swap.requester, swap.receiver],
          swapRequest: swap._id,
        });
      }
    }

    // If completed, recalculate trust scores for both participants (FR9)
    if (status === "completed") {
      await Promise.all([
        calculateTrustScore(swap.requester),
        calculateTrustScore(swap.receiver),
      ]);
    }

    const populated = await swap.populate([
      { path: "requester", select: "-passwordHash" },
      { path: "receiver", select: "-passwordHash" },
      { path: "offeredSkill" },
      { path: "requestedSkill" },
    ]);

    // Send notifications to the other party (FR11)
    const otherUserId = isReceiver
      ? String(swap.requester._id)
      : String(swap.receiver._id);
    const currentUserDoc = await User.findById(req.user.id);
    const senderName = currentUserDoc ? currentUserDoc.name : "Your partner";

    let notifType = "swap_accepted";
    let notifTitle = "Swap Request Accepted";
    let notifMsg = `${senderName} accepted your swap request! You can now start chatting and scheduling lessons.`;

    if (status === "rejected") {
      notifType = "swap_rejected";
      notifTitle = "Swap Request Declined";
      notifMsg = `${senderName} declined your swap request.`;
    } else if (status === "completed") {
      notifType = "swap_completed";
      notifTitle = "Swap Marked Completed! 🌟";
      notifMsg = `${senderName} marked your skill swap as completed. Please leave a rating and review!`;
    } else if (status === "cancelled") {
      notifType = "swap_cancelled";
      notifTitle = "Swap Request Cancelled";
      notifMsg = `${senderName} cancelled the swap request.`;
    }

    const notification = await Notification.create({
      recipient: otherUserId,
      sender: req.user.id,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      link: "/swaps",
      metadata: { swapId: swap._id },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${otherUserId}`).emit("swap:status_changed", populated);
      io.to(`user:${otherUserId}`).emit("notification:new", notification);
    }

    res.json({ success: true, data: { swap: populated, conversation } });
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
