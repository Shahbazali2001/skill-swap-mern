const Review = require("../models/Review");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { calculateTrustScore } = require("../services/trustScoreService");
const { sendReviewAlertEmail } = require("../services/emailService");

// POST /api/v1/reviews -> create a review (FR8)
exports.createReview = async (req, res) => {
  try {
    const { swapRequestId, rating, feedback, tags } = req.body;

    if (!swapRequestId || !rating || !feedback) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION",
          message: "swapRequestId, rating (1-5), and feedback are required",
        },
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION",
          message: "Rating must be between 1 and 5 stars",
        },
      });
    }

    const swap = await SwapRequest.findById(swapRequestId)
      .populate("offeredSkill")
      .populate("requestedSkill");

    if (!swap) {
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Swap request not found" },
        });
    }

    // Only allow reviews on accepted or completed swaps
    if (swap.status !== "completed" && swap.status !== "accepted") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATE",
          message: "Can only review accepted or completed swaps",
        },
      });
    }

    const isRequester = String(swap.requester) === req.user.id;
    const isReceiver = String(swap.receiver) === req.user.id;

    if (!isRequester && !isReceiver) {
      return res
        .status(403)
        .json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not a participant in this swap",
          },
        });
    }

    // Determine who is being reviewed and what skill they taught
    const revieweeId = isRequester ? swap.receiver : swap.requester;
    const skillTaught = isRequester
      ? swap.requestedSkill?._id
      : swap.offeredSkill?._id;

    // Check for existing review
    const existing = await Review.findOne({
      swapRequest: swap._id,
      reviewer: req.user.id,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_REVIEW",
          message: "You have already submitted a review for this swap",
        },
      });
    }

    const review = await Review.create({
      swapRequest: swap._id,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating: Number(rating),
      feedback: feedback.trim(),
      tags: tags || [],
      skillTaught,
    });

    // Recalculate reviewee's trust score & reputation (FR9)
    const updatedTrust = await calculateTrustScore(revieweeId);

    const populatedReview = await review.populate([
      { path: "reviewer", select: "name profileImageUrl location trustTier" },
      { path: "reviewee", select: "name profileImageUrl location trustTier" },
      { path: "skillTaught", select: "name category" },
    ]);

    // Send in-app notification (FR11)
    const reviewerDoc = await User.findById(req.user.id);
    const revieweeDoc = await User.findById(revieweeId);

    const notification = await Notification.create({
      recipient: revieweeId,
      sender: req.user.id,
      type: "review_received",
      title: "New Review Received! ⭐",
      message: `${reviewerDoc.name} gave you a ${rating}-star review: "${feedback.slice(0, 80)}..."`,
      link: `/profile/${revieweeId}`,
      metadata: { reviewId: review._id, swapId: swap._id },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${revieweeId}`).emit("notification:new", notification);
    }

    // Send email alert (FR11)
    if (revieweeDoc) {
      sendReviewAlertEmail({
        toEmail: revieweeDoc.email,
        recipientName: revieweeDoc.name,
        reviewerName: reviewerDoc.name,
        rating,
      }).catch(console.error);
    }

    res.status(201).json({
      success: true,
      data: {
        review: populatedReview,
        trustScoreStats: updatedTrust,
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

// GET /api/v1/reviews/user/:userId -> list reviews received by user (FR8)
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name profileImageUrl location trustTier")
      .populate("skillTaught", "name category")
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avg =
      total > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
        : 0;

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          totalReviews: total,
          averageRating: Number(avg),
        },
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

// GET /api/v1/reviews/swap/:swapId -> get reviews for a specific swap
exports.getSwapReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ swapRequest: req.params.swapId })
      .populate("reviewer", "name profileImageUrl location")
      .populate("reviewee", "name profileImageUrl location");

    const myReview = reviews.find(
      (r) => String(r.reviewer._id) === req.user.id,
    );
    const partnerReview = reviews.find(
      (r) => String(r.reviewer._id) !== req.user.id,
    );

    res.json({
      success: true,
      data: {
        reviews,
        hasReviewed: !!myReview,
        myReview: myReview || null,
        partnerReview: partnerReview || null,
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
