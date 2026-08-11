const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    // ==========================================
    // Skill Title
    // ==========================================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // Category
    // ==========================================
    category: {
      type: String,
      required: true,
      enum: [
        "Programming",
        "Design",
        "Language",
        "Music",
        "Marketing",
        "Business",
        "Photography",
        "Cooking",
        "Fitness",
        "Other",
      ],
    },

    // ==========================================
    // Description
    // ==========================================
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // Skill Level
    // ==========================================
    level: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Expert",
      ],
      default: "Beginner",
    },

    // ==========================================
    // Availability
    // ==========================================
    availability: {
      type: String,
      enum: [
        "Weekdays",
        "Weekends",
        "Anytime",
      ],
      default: "Anytime",
    },

    // ==========================================
    // Archive Status
    // ==========================================
    isArchived: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // Skill Owner
    // ==========================================
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  // ==========================================
  // Timestamps
  // ==========================================
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Skill",
  skillSchema
);