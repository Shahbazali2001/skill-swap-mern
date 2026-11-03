const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// All routes require authenticated admin
router.use(requireAuth, requireAdmin);

// Analytics
router.get("/stats", adminController.getDashboardStats);

// User Moderation
router.get("/users", adminController.listUsers);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.delete("/users/:id", adminController.deleteUser);

// Skill Catalog Management
router.get("/skills", adminController.listSkills);
router.post("/skills", adminController.createSkill);
router.put("/skills/:id", adminController.updateSkill);
router.delete("/skills/:id", adminController.deleteSkill);

// Content Moderation & Reports
router.get("/reports", adminController.listReports);
router.patch("/reports/:id", adminController.updateReport);

module.exports = router;
