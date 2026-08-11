const express = require("express");
const router = express.Router();

// Controllers
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");

// Middleware
const authMiddleware = require("../middleware/authMiddleware");

// =========================
// Public Routes
// =========================

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

// =========================
// Protected Routes
// =========================

// Get Logged-in User Profile
router.get("/profile", authMiddleware, getProfile);

// Update Logged-in User Profile
router.put("/profile", authMiddleware, updateProfile);

// Change Password
router.put("/change-password", authMiddleware, changePassword);

// Delete Account
router.delete("/account", authMiddleware, deleteAccount);

// Export Router
module.exports = router;