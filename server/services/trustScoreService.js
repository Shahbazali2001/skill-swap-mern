const User = require("../models/User");
const Review = require("../models/Review");
const SwapRequest = require("../models/SwapRequest");

/**
 * FR9 - Reputation Score Algorithm
 *
 * Calculates a comprehensive Trust Score (0-100) and Trust Tier:
 * 1. Rating Component (40 pts max): Derived from average star rating.
 * 2. Activity & Swaps Completed (30 pts max): 6 points per completed swap (capped at 30).
 * 3. Review Volume & Positive Feedback (15 pts max): Proportion of 4+ star reviews.
 * 4. Profile Completeness (15 pts max): Bio, Location, and Categorized Skills populated.
 */
async function calculateTrustScore(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const [reviews, completedSwapsCount] = await Promise.all([
    Review.find({ reviewee: userId }),
    SwapRequest.countDocuments({
      $or: [{ requester: userId }, { receiver: userId }],
      status: "completed",
    }),
  ]);

  const ratingsCount = reviews.length;
  let averageRating = 0;
  let positiveReviewsCount = 0;

  if (ratingsCount > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = Number((totalRating / ratingsCount).toFixed(1));
    positiveReviewsCount = reviews.filter((r) => r.rating >= 4).length;
  }

  // 1. Rating Component (40 pts max)
  let ratingPoints = 20; // default for zero reviews
  if (ratingsCount > 0) {
    ratingPoints = (averageRating / 5) * 40;
  }

  // 2. Completed Swaps Component (30 pts max)
  const swapPoints = Math.min(completedSwapsCount * 6, 30);

  // 3. Positive Reviews Ratio (15 pts max)
  let positivePoints = 7.5;
  if (ratingsCount > 0) {
    positivePoints = (positiveReviewsCount / ratingsCount) * 15;
  }

  // 4. Profile Completeness (15 pts max)
  let profilePoints = 0;
  if (user.bio && user.bio.trim().length > 10) profilePoints += 4;
  if (user.location && user.location.trim().length > 2) profilePoints += 4;
  if (user.skillsToTeach && user.skillsToTeach.length > 0) profilePoints += 4;
  if (user.skillsToLearn && user.skillsToLearn.length > 0) profilePoints += 3;

  const rawScore = ratingPoints + swapPoints + positivePoints + profilePoints;
  const trustScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Determine Tier
  let trustTier = "New Swapper";
  if (trustScore >= 90) {
    trustTier = "Master Swapper";
  } else if (trustScore >= 75) {
    trustTier = "Trusted Partner";
  } else if (trustScore >= 50) {
    trustTier = "Verified Member";
  }

  user.trustScore = trustScore;
  user.trustTier = trustTier;
  user.averageRating = averageRating;
  user.ratingsCount = ratingsCount;
  user.totalSwapsCompleted = completedSwapsCount;

  await user.save();

  return {
    trustScore,
    trustTier,
    averageRating,
    ratingsCount,
    totalSwapsCompleted: completedSwapsCount,
  };
}

module.exports = { calculateTrustScore };
