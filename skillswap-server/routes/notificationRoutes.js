const express = require("express");

const router = express.Router();

const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const authMiddleware =
  require("../middleware/authMiddleware");

// ==========================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// ==========================================

router.get(
  "/",
  authMiddleware,
  getMyNotifications
);

// ==========================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// ==========================================

router.get(
  "/unread-count",
  authMiddleware,
  getUnreadCount
);

// ==========================================
// MARK ALL AS READ
// PUT /api/notifications/read-all
// ==========================================

router.put(
  "/read-all",
  authMiddleware,
  markAllAsRead
);

// ==========================================
// MARK SINGLE AS READ
// PUT /api/notifications/:id/read
// ==========================================

router.put(
  "/:id/read",
  authMiddleware,
  markAsRead
);

// ==========================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

module.exports = router;