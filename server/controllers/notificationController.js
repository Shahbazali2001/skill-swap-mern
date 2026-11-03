const Notification = require("../models/Notification");

// GET /api/v1/notifications -> list user's notifications (FR11)
exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name profileImageUrl")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
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

// PATCH /api/v1/notifications/:id/read -> mark one as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Notification not found" },
        });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    });

    res.json({ success: true, data: { notification, unreadCount } });
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

// PATCH /api/v1/notifications/read-all -> mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true },
    );

    res.json({
      success: true,
      data: { message: "All notifications marked as read", unreadCount: 0 },
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

// DELETE /api/v1/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });
    res.json({ success: true, data: { message: "Notification removed" } });
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
