const mongoose = require("mongoose");
const Skill = require("../models/Skill");

// ==========================================
// Helper: Validate MongoDB ID
// ==========================================

const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ==========================================
// Create Skill
// ==========================================

exports.createSkill = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      level,
      availability,
    } = req.body;

    if (
      !title ||
      !category ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, category and description are required",
      });
    }

    const skill = await Skill.create({
      title,
      category,
      description,
      level,
      availability,
      owner: req.user.id,
    });

    const populatedSkill =
      await Skill.findById(skill._id).populate(
        "owner",
        "fullName email profileImage"
      );

    return res.status(201).json({
      success: true,
      message: "Skill created successfully",
      skill: populatedSkill,
    });
  } catch (error) {
    console.error(
      "Create Skill Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Skills
// ==========================================

exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find({
      isArchived: false,
    })
      .populate(
        "owner",
        "fullName email profileImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error(
      "Get All Skills Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Skill By ID
// ==========================================

exports.getSkillById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    const skill = await Skill.findById(id).populate(
      "owner",
      "fullName email profileImage"
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    return res.status(200).json({
      success: true,
      skill,
    });
  } catch (error) {
    console.error(
      "Get Skill Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Skill
// ==========================================

exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Ownership check
    if (
      skill.owner.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this skill",
      });
    }

    const allowedFields = [
      "title",
      "category",
      "description",
      "level",
      "availability",
    ];

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        skill[field] = req.body[field];
      }
    });

    await skill.save();

    const updatedSkill =
      await Skill.findById(skill._id).populate(
        "owner",
        "fullName email profileImage"
      );

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      skill: updatedSkill,
    });
  } catch (error) {
    console.error(
      "Update Skill Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Delete Skill
// ==========================================

exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Ownership check
    if (
      skill.owner.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this skill",
      });
    }

    await Skill.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Skill Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Archive / Unarchive Skill
// ==========================================

exports.toggleArchiveSkill = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Ownership check
    if (
      skill.owner.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to modify this skill",
      });
    }

    skill.isArchived =
      !skill.isArchived;

    await skill.save();

    return res.status(200).json({
      success: true,
      message: skill.isArchived
        ? "Skill archived successfully"
        : "Skill restored successfully",
      skill,
    });
  } catch (error) {
    console.error(
      "Archive Skill Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get My Skills
// ==========================================

exports.getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({
      owner: req.user.id,
    })
      .populate(
        "owner",
        "fullName email profileImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error(
      "Get My Skills Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Search Skills
// ==========================================

exports.searchSkills = async (req, res) => {
  try {
    const keyword =
      req.query.keyword?.trim();

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a search keyword",
      });
    }

    const skills = await Skill.find({
      isArchived: false,

      $or: [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    })
      .populate(
        "owner",
        "fullName email profileImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error(
      "Search Skills Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Filter Skills By Category
// ==========================================

exports.getSkillsByCategory = async (
  req,
  res
) => {
  try {
    const { category } = req.params;

    const skills = await Skill.find({
      category: {
        $regex: `^${category}$`,
        $options: "i",
      },

      isArchived: false,
    })
      .populate(
        "owner",
        "fullName email profileImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error(
      "Category Skills Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};