const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    // ======================================
    // Related Swap Request
    // ======================================

    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
    },

    // ======================================
    // Session Participants
    // ======================================

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // ======================================
    // Topic
    // ======================================

    topic: {
      type: String,
      trim: true,
      default: "",
    },

    // ======================================
    // Scheduled Date & Time
    // ======================================

    scheduledAt: {
      type: Date,
      required: true,
    },

    // ======================================
    // Duration
    // ======================================

    durationMinutes: {
      type: Number,
      default: 60,
      min: 1,
    },

    // ======================================
    // Video Room ID
    // ======================================

    roomId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ======================================
    // Status
    // ======================================

    status: {
      type: String,
      enum: [
        "Scheduled",
        "Completed",
        "Cancelled",
      ],
      default: "Scheduled",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Session",
  sessionSchema
);