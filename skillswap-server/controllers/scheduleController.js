const Session = require("../models/Session");
const SwapRequest = require("../models/SwapRequest");
const createNotification = require("../utils/createNotification");

// ======================================
// Create Session
// ======================================

exports.createSession = async (req, res) => {
  try {
    const {
      swapRequest,
      scheduledAt,
      topic,
      durationMinutes,
    } = req.body;

    // ======================================
    // Validate required fields
    // ======================================

    if (!swapRequest || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message:
          "swapRequest and scheduledAt are required",
      });
    }

    // ======================================
    // Find Swap Request
    // ======================================

    const swapDoc =
      await SwapRequest.findById(swapRequest);

    if (!swapDoc) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found",
      });
    }

    // ======================================
    // Only accepted swaps can be scheduled
    // ======================================

    if (swapDoc.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message:
          "A session can only be scheduled for an accepted swap",
      });
    }

    // ======================================
    // Check authenticated user
    // ======================================

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ======================================
    // Check participant
    // ======================================

    const currentUserId =
      req.user.id.toString();

    const senderId =
      swapDoc.sender.toString();

    const receiverId =
      swapDoc.receiver.toString();

    const isParticipant =
      senderId === currentUserId ||
      receiverId === currentUserId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You were not part of this swap",
      });
    }

    // ======================================
    // Validate date
    // ======================================

    const sessionDate =
      new Date(scheduledAt);

    if (Number.isNaN(sessionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date",
      });
    }

    // ======================================
    // Must be future date
    // ======================================

    if (sessionDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Session must be scheduled for a future date",
      });
    }

    // ======================================
    // Duration
    // ======================================

    const duration =
      Number(durationMinutes) || 60;

    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Duration must be greater than 0 minutes",
      });
    }

    // ======================================
    // Prevent duplicate active sessions
    // ======================================

    const existingSession =
      await Session.findOne({
        swapRequest: swapDoc._id,
        status: "Scheduled",
      });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message:
          "A session is already scheduled for this swap",
      });
    }

    // ======================================
    // Generate Video Room ID
    // ======================================

    const roomId =
      `skillswap-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;

    // ======================================
    // Create Session
    // ======================================

    const session =
      await Session.create({
        swapRequest: swapDoc._id,

        participants: [
          swapDoc.sender,
          swapDoc.receiver,
        ],

        topic:
          typeof topic === "string"
            ? topic.trim()
            : "",

        scheduledAt: sessionDate,

        durationMinutes: duration,

        status: "Scheduled",

        roomId,
      });

    console.log(
      "✅ Session created:",
      session._id
    );

    // ======================================
    // Find Other Participant
    // ======================================

    const otherUser =
      senderId === currentUserId
        ? swapDoc.receiver
        : swapDoc.sender;

    // ======================================
    // Create Session Notification
    // ======================================

    try {
      await createNotification({
        user: otherUser,

        type: "session_scheduled",

        text:
          `A new skill swap session has been scheduled for ${sessionDate.toLocaleString(
            "en-IN",
            {
              dateStyle: "medium",
              timeStyle: "short",
            }
          )}`,

        link:
          "/dashboard/schedule",

        relatedUser: req.user.id,

        relatedId: session._id,
      });
    } catch (notificationError) {
      console.error(
        "Session notification error:",
        notificationError
      );
    }

    // ======================================
    // Response
    // ======================================

    return res.status(201).json({
      success: true,

      message:
        "Session scheduled successfully",

      session,
    });
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "Create session error:",
      error
    );

    console.error(
      "================================"
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
};

// ======================================
// Get My Sessions
// ======================================

exports.getMySessions = async (req, res) => {
  try {
    const sessions =
      await Session.find({
        participants: req.user.id,
      })
        .populate(
          "participants",
          "fullName profileImage"
        )
        .populate(
          "swapRequest",
          "senderSkill receiverSkill status"
        )
        .sort({
          scheduledAt: 1,
        });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error(
      "Get sessions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// ======================================
// Update Session Status
// ======================================

exports.updateSessionStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    // ======================================
    // Allowed statuses
    // ======================================

    const allowedStatuses = [
      "Scheduled",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Scheduled, Completed or Cancelled",
      });
    }

    // ======================================
    // Find Session
    // ======================================

    const session =
      await Session.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // ======================================
    // Check authenticated user
    // ======================================

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    // ======================================
    // Check participant
    // ======================================

    const currentUserId =
      req.user.id.toString();

    const isParticipant =
      session.participants.some(
        (participant) =>
          participant.toString() ===
          currentUserId
      );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ======================================
    // Prevent unnecessary update
    // ======================================

    if (session.status === status) {
      return res.status(400).json({
        success: false,
        message:
          `Session is already ${status}`,
      });
    }

    // ======================================
    // Find Other Participant
    // ======================================

    const otherParticipant =
      session.participants.find(
        (participant) =>
          participant.toString() !==
          currentUserId
      );

    // ======================================
    // Update status
    // ======================================

    session.status = status;

    await session.save();

    // ======================================
    // Notification
    // ======================================

    try {
      let notificationType = "system";
      let notificationText = "";

      if (status === "Completed") {
        notificationType =
          "session_completed";

        notificationText =
          "Your skill swap session has been marked as completed.";
      }

      if (status === "Cancelled") {
        notificationType =
          "session_cancelled";

        notificationText =
          "Your skill swap session has been cancelled.";
      }

      if (status === "Scheduled") {
        notificationType =
          "session_scheduled";

        notificationText =
          "Your skill swap session has been scheduled.";
      }

      if (otherParticipant) {
        await createNotification({
          user: otherParticipant,

          type: notificationType,

          text: notificationText,

          link:
            "/dashboard/schedule",

          relatedUser:
            req.user.id,

          relatedId:
            session._id,
        });
      }
    } catch (notificationError) {
      // Notification failure should NOT
      // make status update fail.

      console.error(
        "Status notification error:",
        notificationError
      );
    }

    // ======================================
    // Response
    // ======================================

    return res.status(200).json({
      success: true,

      message:
        "Session updated successfully",

      session,
    });
  } catch (error) {
    console.error(
      "Update session status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};