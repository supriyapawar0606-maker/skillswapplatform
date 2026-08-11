const Skill = require("../models/Skill");

// ==========================================
// Get All Skills Except Logged-in User
// ==========================================

exports.getDiscoverSkills = async (req, res) => {
  try {

    const skills = await Skill.find({
      owner: { $ne: req.user.id },
    })
      .populate(
        "owner",
        "fullName email profileImage location"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Get Recommended Skills For Logged-in User
//
// Real (non-mock) matching, built from the user's
// own data:
//   1. Skills that match something on their wishlist
//      (User.skillsWanted)
//   2. Skills in the same categories they already teach
//      (simple co-occurrence proxy)
//   3. Newest skills on the platform as a fallback, so
//      the panel is never empty for a brand-new user
// ==========================================

exports.getRecommendedSkills = async (req, res) => {
  try {
    const User = require("../models/User");
    const userId = req.user.id;

    const [me, mySkills] = await Promise.all([
      User.findById(userId).select("skillsWanted"),
      Skill.find({ owner: userId, isArchived: false }).select(
        "category"
      ),
    ]);

    const myCategories = [
      ...new Set(mySkills.map((s) => s.category)),
    ];

    const picks = [];
    const usedIds = new Set();

    const addPicks = (skills, reasonFn) => {
      for (const s of skills) {
        if (picks.length >= 3) break;
        if (usedIds.has(String(s._id))) continue;

        usedIds.add(String(s._id));

        picks.push({
          id: s._id,
          title: s.title,
          category: s.category,
          reason: reasonFn(s),
        });
      }
    };

    // 1. Wishlist matches
    if (me?.skillsWanted?.length) {
      const wantedRegexes = me.skillsWanted
        .filter(Boolean)
        .map(
          (w) =>
            new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        );

      if (wantedRegexes.length) {
        const wanted = await Skill.find({
          owner: { $ne: userId },
          isArchived: false,
          title: { $in: wantedRegexes },
        })
          .select("title category")
          .limit(5);

        addPicks(wanted, () => "On your wishlist");
      }
    }

    // 2. Same category as what they teach
    if (picks.length < 3 && myCategories.length) {
      const related = await Skill.find({
        owner: { $ne: userId },
        isArchived: false,
        category: { $in: myCategories },
      })
        .select("title category")
        .sort({ createdAt: -1 })
        .limit(5);

      addPicks(related, (s) => `Because you teach ${s.category}`);
    }

    // 3. Fallback: newest skills overall
    if (picks.length < 3) {
      const fallback = await Skill.find({
        owner: { $ne: userId },
        isArchived: false,
        _id: { $nin: [...usedIds] },
      })
        .select("title category")
        .sort({ createdAt: -1 })
        .limit(3 - picks.length);

      addPicks(fallback, () => "New on SkillSwap");
    }

    res.status(200).json({
      success: true,
      recommended: picks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};