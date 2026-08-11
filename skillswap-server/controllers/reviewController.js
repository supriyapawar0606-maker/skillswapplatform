const Review = require("../models/Review");
const SwapRequest = require("../models/SwapRequest");
const createNotification = require("../utils/createNotification");

// ======================================
// Create Review (after a completed/accepted swap)
// ======================================
exports.createReview = async (req, res) => {
  try {
    const { swap, reviewee, rating, comment, skillTaught } = req.body;

    if (!swap || !reviewee || !rating) {
      return res.status(400).json({
        success: false,
        message: "Swap, reviewee and rating are required",
      });
    }

    const swapDoc = await SwapRequest.findById(swap);

    if (!swapDoc) {
      return res.status(404).json({
        success: false,
        message: "Swap not found",
      });
    }

    const isParticipant =
      swapDoc.sender.toString() === req.user.id.toString() ||
      swapDoc.receiver.toString() === req.user.id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You were not part of this swap",
      });
    }

    const review = await Review.create({
      swap,
      reviewer: req.user.id,
      reviewee,
      rating,
      comment: comment || "",
      skillTaught: skillTaught || "",
    });

    const populated = await Review.findById(review._id)
      .populate("reviewer", "fullName profileImage")
      .populate("reviewee", "fullName profileImage");

    await createNotification({
      user: reviewee,
      type: "review",
      text: `${populated.reviewer.fullName} left you a ${rating}-star review`,
      link: "/dashboard/reviews",
      relatedUser: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this swap",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get Reviews Received By Logged-in User
// ======================================
exports.getMyReceivedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.user.id })
      .populate("reviewer", "fullName profileImage")
      .populate("swap", "senderSkill receiverSkill")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Number(avgRating.toFixed(1)),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get Reviews Given By Logged-in User
// ======================================
exports.getMyGivenReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate("reviewee", "fullName profileImage")
      .populate("swap", "senderSkill receiverSkill")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get Reviews for Any User (public profile use)
// ======================================
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "fullName profileImage")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Number(avgRating.toFixed(1)),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
