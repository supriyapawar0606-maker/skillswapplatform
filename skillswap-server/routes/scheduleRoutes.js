const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createSession,
  getMySessions,
  updateSessionStatus,
} = require("../controllers/scheduleController");

router.post("/", authMiddleware, createSession);
router.get("/mine", authMiddleware, getMySessions);
router.put("/:id/status", authMiddleware, updateSessionStatus);

module.exports = router;
