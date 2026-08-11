const User = require("../models/User");
const Skill = require("../models/Skill");
const SwapRequest = require("../models/SwapRequest");
const Review = require("../models/Review");

// ======================================
// Get Admin Dashboard Stats
// ======================================
exports.getAdminStats = async (req, res) => {
  try {
    const [userCount, skillCount, swapCount, pendingSwaps, reviewCount] = await Promise.all([
      User.countDocuments(),
      Skill.countDocuments(),
      SwapRequest.countDocuments(),
      SwapRequest.countDocuments({ status: "Pending" }),
      Review.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: { userCount, skillCount, swapCount, pendingSwaps, reviewCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get All Users
// ======================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Delete User
// ======================================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get All Skills (moderation)
// ======================================
exports.getAllSkillsAdmin = async (req, res) => {
  try {
    const skills = await Skill.find()
      .populate("owner", "fullName email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: skills.length, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Delete Skill (moderation)
// ======================================
exports.deleteSkillAdmin = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    res.status(200).json({ success: true, message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
