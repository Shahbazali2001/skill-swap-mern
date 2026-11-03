const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

router.get("/", requireAuth, notificationController.listNotifications);
router.patch("/read-all", requireAuth, notificationController.markAllAsRead);
router.patch("/:id/read", requireAuth, notificationController.markAsRead);
router.delete("/:id", requireAuth, notificationController.deleteNotification);

module.exports = router;
