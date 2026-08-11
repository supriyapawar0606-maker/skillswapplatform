const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  toggleBookmark,
  getMyBookmarks,
} = require("../controllers/bookmarkController");

router.post("/toggle", authMiddleware, toggleBookmark);
router.get("/mine", authMiddleware, getMyBookmarks);

module.exports = router;
