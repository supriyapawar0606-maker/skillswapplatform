const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetType: {
      type: String,
      enum: ["Skill", "User"],
      required: true,
    },

    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    },

    bookmarkedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.index(
  { user: 1, skill: 1 },
  { unique: true, partialFilterExpression: { skill: { $exists: true } } }
);

bookmarkSchema.index(
  { user: 1, bookmarkedUser: 1 },
  { unique: true, partialFilterExpression: { bookmarkedUser: { $exists: true } } }
);

module.exports = mongoose.model("Bookmark", bookmarkSchema);
