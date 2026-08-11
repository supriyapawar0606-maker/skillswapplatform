const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const {
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAllSkillsAdmin,
  deleteSkillAdmin,
} = require("../controllers/adminController");

router.get("/stats", authMiddleware, isAdmin, getAdminStats);
router.get("/users", authMiddleware, isAdmin, getAllUsers);
router.delete("/users/:id", authMiddleware, isAdmin, deleteUser);
router.get("/skills", authMiddleware, isAdmin, getAllSkillsAdmin);
router.delete("/skills/:id", authMiddleware, isAdmin, deleteSkillAdmin);

module.exports = router;
