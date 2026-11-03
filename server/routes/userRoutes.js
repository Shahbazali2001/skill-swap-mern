const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const userController = require("../controllers/userController");

// FR4: Advanced Search
router.get("/search", requireAuth, userController.searchUsers);

// FR10: Recently viewed
router.get(
  "/me/recently-viewed",
  requireAuth,
  userController.getRecentlyViewed,
);

// FR2 & FR3: Profile & Skills management
router.put("/me", requireAuth, userController.updateProfile);
router.put("/me/skills", requireAuth, userController.updateSkills);

// List and public profile
router.get("/", requireAuth, userController.listUsers);
router.get("/:id", requireAuth, userController.getPublicProfile);

module.exports = router;
