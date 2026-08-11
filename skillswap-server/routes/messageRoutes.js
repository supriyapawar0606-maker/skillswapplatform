const express = require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  sendMessage,
  getConversation,
  getRecentChats,
  markAsRead,
  markConversationAsRead,
  getUnreadMessageCount,
} = require("../controllers/messageController");


// ======================================
// Protected Routes
// ======================================


// ======================================
// Send Message
// ======================================

router.post(
  "/send",
  authMiddleware,
  sendMessage
);


// ======================================
// Get Conversation
// ======================================

router.get(
  "/conversation/:userId",
  authMiddleware,
  getConversation
);


// ======================================
// Get Recent Chats
// ======================================

router.get(
  "/chats",
  authMiddleware,
  getRecentChats
);


// ======================================
// Mark Conversation as Read
// IMPORTANT: Put this BEFORE /read/:id
// ======================================

router.put(
  "/read/conversation/:userId",
  authMiddleware,
  markConversationAsRead
);


// ======================================
// Mark Single Message as Read
// ======================================

router.put(
  "/read/:id",
  authMiddleware,
  markAsRead
);


// ======================================
// Get Unread Message Count
// ======================================

router.get(
  "/unread-count",
  authMiddleware,
  getUnreadMessageCount
);


module.exports = router;