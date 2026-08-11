const Notification = require("../models/Notification");

const {
  getIO,
  getOnlineUsers,
} = require("../socket/socket");

// ======================================================
// CREATE NOTIFICATION
// ======================================================

const createNotification = async ({
  user,
  type,
  text,
  relatedUser = null,
  relatedId = null,
  link = "",
}) => {
  try {
    // ====================================================
    // Validate
    // ====================================================

    if (!user) {
      console.error(
        "❌ Notification user is required"
      );

      return null;
    }

    if (!type) {
      console.error(
        "❌ Notification type is required"
      );

      return null;
    }

    if (!text) {
      console.error(
        "❌ Notification text is required"
      );

      return null;
    }

    // ====================================================
    // Create Notification
    // ====================================================

    const notification =
      await Notification.create({
        user,
        type,
        text,
        relatedUser,
        relatedId,
        link,
        isRead: false,
      });

    console.log(
      "🔔 Notification created:",
      notification._id.toString()
    );

    // ====================================================
    // REAL-TIME SOCKET EVENT
    // ====================================================

    try {
      const io = getIO();

      const onlineUsers =
        getOnlineUsers();

      const receiverSocket =
        onlineUsers.get(
          String(user)
        );

      if (receiverSocket) {

        io.to(receiverSocket).emit(
          "notificationCreated",
          {
            notification,
            countChange: 1,
          }
        );

        console.log(
          `🔔 Real-time notification sent to ${user}`
        );
      }

    } catch (socketError) {

      console.error(
        "Socket notification error:",
        socketError.message
      );

    }

    return notification;

  } catch (error) {

    console.error(
      "❌ Create notification error:",
      error
    );

    return null;
  }
};

module.exports = createNotification;