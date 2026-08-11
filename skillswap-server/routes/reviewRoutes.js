const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createReview,
  getMyReceivedReviews,
  getMyGivenReviews,
  getUserReviews,
} = require("../controllers/reviewController");

router.post("/", authMiddleware, createReview);
router.get("/mine", authMiddleware, getMyReceivedReviews);
router.get("/given", authMiddleware, getMyGivenReviews);
router.get("/user/:userId", getUserReviews);

module.exports = router;
