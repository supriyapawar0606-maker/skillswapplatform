const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  searchSkills,
  getSkillsByCategory,
  getMySkills,
  toggleArchiveSkill,
} = require("../controllers/skillController");

const {
  getDiscoverSkills,
  getRecommendedSkills,
} = require("../controllers/discoverController");

// ==========================================
// Public Routes
// ==========================================

// Get all active skills
router.get("/", getAllSkills);

// Search
router.get(
  "/search",
  searchSkills
);

// Category
router.get(
  "/category/:category",
  getSkillsByCategory
);

// ==========================================
// Protected Routes
// ==========================================

// Create
router.post(
  "/",
  authMiddleware,
  createSkill
);

// My Skills
router.get(
  "/my-skills",
  authMiddleware,
  getMySkills
);

// Discover
router.get(
  "/discover",
  authMiddleware,
  getDiscoverSkills
);

// Recommended (must come before /:id)
router.get(
  "/recommended",
  authMiddleware,
  getRecommendedSkills
);

// Archive / Restore
router.put(
  "/:id/archive",
  authMiddleware,
  toggleArchiveSkill
);

// Update
router.put(
  "/:id",
  authMiddleware,
  updateSkill
);

// Delete
router.delete(
  "/:id",
  authMiddleware,
  deleteSkill
);

// Single Skill
// Keep this LAST
router.get(
  "/:id",
  getSkillById
);

module.exports = router;