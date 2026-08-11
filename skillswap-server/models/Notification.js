const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // User who receives the notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Type of notification
    type: {
      type: String,
      enum: [
        "swap_request",
        "swap_accepted",
        "swap_rejected",
        "session_scheduled",
        "session_cancelled",
        "session_completed",
        "message",
        "review",
        "workshop",
        "system",
      ],
      required: true,
    },

    // Notification message
    text: {
      type: String,
      required: true,
      trim: true,
    },

    // User related to the notification
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Optional related document
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Page to open when notification is clicked
    link: {
      type: String,
      default: "",
      trim: true,
    },

    // Read/unread status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Faster notification loading
notificationSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);