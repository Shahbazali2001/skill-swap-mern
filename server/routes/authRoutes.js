const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
