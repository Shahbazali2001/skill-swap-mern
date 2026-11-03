const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const reviewController = require("../controllers/reviewController");

router.post("/", requireAuth, reviewController.createReview);
router.get("/user/:userId", requireAuth, reviewController.getUserReviews);
router.get("/swap/:swapId", requireAuth, reviewController.getSwapReviews);

module.exports = router;
