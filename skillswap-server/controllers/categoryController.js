const Skill = require("../models/Skill");

// ======================================
// Get Skill Counts Grouped By Category
// ======================================
exports.getCategoryStats = async (req, res) => {
  try {
    const counts = await Skill.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categories = counts.map((c) => ({
      name: c._id,
      count: c.count,
    }));

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get Trending Skills (most learners = most accepted swaps requesting that skill)
// ======================================
exports.getTrendingSkills = async (req, res) => {
  try {
    const SwapRequest = require("../models/SwapRequest");

    const trending = await SwapRequest.aggregate([
      { $group: { _id: "$receiverSkill", learners: { $sum: 1 } } },
      { $sort: { learners: -1 } },
      { $limit: 5 },
    ]);

    const populated = await Skill.populate(trending, {
      path: "_id",
      select: "title category",
    });

    const trendingSkills = populated
      .filter((t) => t._id)
      .map((t) => ({
        id: t._id._id,
        name: t._id.title,
        category: t._id.category,
        learners: t.learners,
      }));

    res.status(200).json({
      success: true,
      trendingSkills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get Public Site-Wide Stats (for Home page)
// ======================================
exports.getSiteStats = async (req, res) => {
  try {
    const User = require("../models/User");
    const SwapRequest = require("../models/SwapRequest");
    const Review = require("../models/Review");

    const [userCount, skillCount, completedSwaps, reviews] = await Promise.all([
      User.countDocuments(),
      Skill.countDocuments(),
      SwapRequest.countDocuments({ status: "Accepted" }),
      Review.find(),
    ]);

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        userCount,
        skillCount,
        completedSwaps,
        averageRating: Number(avgRating.toFixed(1)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
