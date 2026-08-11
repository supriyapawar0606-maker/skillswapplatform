const express = require("express");
const router = express.Router();

const {
  getCategoryStats,
  getTrendingSkills,
  getSiteStats,
} = require("../controllers/categoryController");

router.get("/", getCategoryStats);
router.get("/trending", getTrendingSkills);
router.get("/site-stats", getSiteStats);

module.exports = router;
