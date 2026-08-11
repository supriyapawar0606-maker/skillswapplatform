const Bookmark = require("../models/Bookmark");

// ======================================
// Toggle Bookmark (Skill or User)
// ======================================
exports.toggleBookmark = async (req, res) => {
  try {
    const { targetType, skill, bookmarkedUser } = req.body;

    if (!targetType || (targetType !== "Skill" && targetType !== "User")) {
      return res.status(400).json({
        success: false,
        message: "targetType must be 'Skill' or 'User'",
      });
    }

    const query =
      targetType === "Skill"
        ? { user: req.user.id, skill }
        : { user: req.user.id, bookmarkedUser };

    const existing = await Bookmark.findOne(query);

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        bookmarked: false,
        message: "Bookmark removed",
      });
    }

    const bookmark = await Bookmark.create({
      user: req.user.id,
      targetType,
      skill: targetType === "Skill" ? skill : undefined,
      bookmarkedUser: targetType === "User" ? bookmarkedUser : undefined,
    });

    res.status(201).json({
      success: true,
      bookmarked: true,
      message: "Bookmark added",
      bookmark,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get My Bookmarks (skills + users)
// ======================================
exports.getMyBookmarks = async (req, res) => {
  try {
    const skillBookmarks = await Bookmark.find({
      user: req.user.id,
      targetType: "Skill",
    })
      .populate({
        path: "skill",
        populate: { path: "owner", select: "fullName email profileImage" },
      })
      .sort({ createdAt: -1 });

    const userBookmarks = await Bookmark.find({
      user: req.user.id,
      targetType: "User",
    })
      .populate("bookmarkedUser", "fullName email profileImage bio location skillsOffered")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      skills: skillBookmarks
        .filter((b) => b.skill)
        .map((b) => b.skill),
      users: userBookmarks
        .filter((b) => b.bookmarkedUser)
        .map((b) => b.bookmarkedUser),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
