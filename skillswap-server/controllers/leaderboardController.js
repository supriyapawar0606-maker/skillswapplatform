const User = require("../models/User");
const SwapRequest = require("../models/SwapRequest");
const Review = require("../models/Review");
const Skill = require("../models/Skill");

// ======================================
// Get Leaderboard
// ======================================
exports.getLeaderboard = async (req, res) => {
  try {
    // Get all users
    const users = await User.find()
      .select("fullName profileImage location")
      .lean();

    const leaderboard = await Promise.all(
      users.map(async (user) => {
        // ======================================
        // Completed Swaps
        // ======================================

        const completedSwaps =
          await SwapRequest.countDocuments({
            $or: [
              { sender: user._id },
              { receiver: user._id },
            ],
            status: "Accepted",
          });

        // ======================================
        // Reviews
        // ======================================

        const reviews = await Review.find({
          reviewee: user._id,
        }).select("rating");

        const reviewCount = reviews.length;

        const totalRating = reviews.reduce(
          (sum, review) =>
            sum + Number(review.rating || 0),
          0
        );

        const averageRating =
          reviewCount > 0
            ? totalRating / reviewCount
            : 0;

        // ======================================
        // Points
        // ======================================

        const points =
          completedSwaps * 10 +
          Math.round(
            averageRating * reviewCount * 2
          );

        // ======================================
        // User Skills / Categories
        // ======================================

        const skills = await Skill.find({
          owner: user._id,
        }).select("category");

        const categories = [
          ...new Set(
            skills
              .map((skill) => skill.category)
              .filter(Boolean)
          ),
        ];

        // Use first category for display
        const category =
          categories.length > 0
            ? categories[0]
            : "General";

        return {
          user: {
            _id: user._id,
            fullName: user.fullName,
            profileImage: user.profileImage,
            location: user.location,
          },

          category,

          categories,

          completedSwaps,

          averageRating: Number(
            averageRating.toFixed(1)
          ),

          reviewCount,

          points,
        };
      })
    );

    // ======================================
    // Sort by Points
    // ======================================

    leaderboard.sort(
      (a, b) => b.points - a.points
    );

    // ======================================
    // Add Rank
    // ======================================

    const rankedLeaderboard =
      leaderboard.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    // ======================================
    // Response
    // ======================================

    res.status(200).json({
      success: true,
      count: rankedLeaderboard.length,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    console.error(
      "Get leaderboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};