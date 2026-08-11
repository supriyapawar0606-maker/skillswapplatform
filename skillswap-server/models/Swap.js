const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

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

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    level: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Expert",
      ],
      default: "Beginner",
    },

    availability: {
      type: String,
      enum: [
        "Weekdays",
        "Weekends",
        "Anytime",
      ],
      default: "Anytime",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ======================================
    // Archive
    // ======================================

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Skill", skillSchema);