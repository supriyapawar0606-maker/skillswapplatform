const Message = require("../models/Message");

const {
  getIO,
  getOnlineUsers,
} = require("../socket/socket");

const createNotification = require("../utils/createNotification");


// ======================================
// Send Message
// ======================================

exports.sendMessage = async (req, res) => {
  try {
    const {
      receiver,
      message,
    } = req.body;

    // ======================================
    // Validate
    // ======================================

    if (
      !receiver ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver and message are required",
      });
    }

    const senderId =
      String(req.user.id);

    const receiverId =
      String(receiver);

    // ======================================
    // Create Message
    // ======================================

    const newMessage =
      await Message.create({
        sender: senderId,
        receiver: receiverId,
        message: message.trim(),
        isRead: false,
      });

    // ======================================
    // Populate Message
    // ======================================

    const populatedMessage =
      await Message.findById(
        newMessage._id
      )
        .populate(
          "sender",
          "fullName profileImage"
        )
        .populate(
          "receiver",
          "fullName profileImage"
        );

    // ======================================
    // Socket.IO
    // ======================================

    const io = getIO();

    const onlineUsers =
      getOnlineUsers();

    const receiverSocket =
      onlineUsers.get(receiverId);

    if (receiverSocket) {

      // ======================================
      // Receiver is online
      // ======================================

      io.to(receiverSocket).emit(
        "newMessage",
        populatedMessage
      );

      console.log(
        `📨 Message delivered to ${receiverId}`
      );

    } else {

      // ======================================
      // Receiver is offline
      // ======================================

      try {

        await createNotification({
          user: receiverId,
          type: "message",
          text:
            `${populatedMessage.sender.fullName} sent you a message`,
          link: "/dashboard/chat",
          relatedUser: senderId,
        });

        console.log(
          `🔔 Message notification created for ${receiverId}`
        );

      } catch (
        notificationError
      ) {

        console.error(
          "Notification creation failed:",
          notificationError.message
        );

      }

    }

    // ======================================
    // Response
    // ======================================

    return res.status(201).json({
      success: true,
      message:
        "Message sent successfully",
      data: populatedMessage,
    });

  } catch (error) {

    console.error(
      "Send message error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================
// Get Conversation
// ======================================

exports.getConversation = async (
  req,
  res
) => {

  try {

    const otherUserId =
      String(req.params.userId);

    const currentUserId =
      String(req.user.id);

    const messages =
      await Message.find({
        $or: [
          {
            sender: currentUserId,
            receiver: otherUserId,
          },
          {
            sender: otherUserId,
            receiver: currentUserId,
          },
        ],
      })
        .populate(
          "sender",
          "fullName profileImage"
        )
        .populate(
          "receiver",
          "fullName profileImage"
        )
        .sort({
          createdAt: 1,
        });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });

  } catch (error) {

    console.error(
      "Get conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


// ======================================
// Get Recent Chats
// ======================================

exports.getRecentChats = async (
  req,
  res
) => {

  try {

    const currentUserId =
      String(req.user.id);

    const chats =
      await Message.find({
        $or: [
          {
            sender: currentUserId,
          },
          {
            receiver: currentUserId,
          },
        ],
      })
        .populate(
          "sender",
          "fullName profileImage"
        )
        .populate(
          "receiver",
          "fullName profileImage"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: chats.length,
      chats,
    });

  } catch (error) {

    console.error(
      "Get recent chats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


// ======================================
// Mark Message as Read
// ======================================

exports.markAsRead = async (
  req,
  res
) => {

  try {

    const message =
      await Message.findById(
        req.params.id
      );

    // ======================================
    // Message Not Found
    // ======================================

    if (!message) {

      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });

    }

    // ======================================
    // Authorization
    // ======================================

    if (
      String(message.receiver) !==
      String(req.user.id)
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Unauthorized",
      });

    }

    // ======================================
    // Already Read
    // ======================================

    if (message.isRead) {

      return res.status(200).json({
        success: true,
        message:
          "Message already marked as read",
        data: message,
      });

    }

    // ======================================
    // Mark Read
    // ======================================

    message.isRead = true;

    await message.save();

    // ======================================
    // Real-Time Event
    // ======================================

    try {

      const io = getIO();

      const onlineUsers =
        getOnlineUsers();

      const senderId =
        String(message.sender);

      const senderSocket =
        onlineUsers.get(
          senderId
        );

      if (senderSocket) {

        io.to(senderSocket).emit(
          "messageRead",
          {
            messageId:
              String(message._id),

            readBy:
              String(req.user.id),

            countChange: -1,
          }
        );

      }

    } catch (socketError) {

      console.error(
        "Message read socket error:",
        socketError.message
      );

    }

    // ======================================
    // Response
    // ======================================

    return res.status(200).json({
      success: true,
      message:
        "Message marked as read",
      data: message,
    });

  } catch (error) {

    console.error(
      "Mark message read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


// ======================================
// Mark Conversation as Read
// ======================================

exports.markConversationAsRead =
  async (req, res) => {

    try {

      const currentUserId =
        String(req.user.id);

      const otherUserId =
        String(req.params.userId);

      // ======================================
      // Find Unread Messages
      // ======================================

      const unreadMessages =
        await Message.find({
          sender: otherUserId,
          receiver: currentUserId,
          isRead: false,
        }).select("_id sender");

      // ======================================
      // Nothing To Update
      // ======================================

      if (
        unreadMessages.length === 0
      ) {

        return res.status(200).json({
          success: true,
          message:
            "No unread messages",
          count: 0,
        });

      }

      // ======================================
      // Mark All Read
      // ======================================

      await Message.updateMany(
        {
          sender: otherUserId,
          receiver: currentUserId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

      const markedCount =
        unreadMessages.length;

      // ======================================
      // Notify Sender
      // ======================================

      try {

        const io = getIO();

        const onlineUsers =
          getOnlineUsers();

        const senderSocket =
          onlineUsers.get(
            otherUserId
          );

        if (senderSocket) {

          io.to(senderSocket).emit(
            "conversationRead",
            {
              userId:
                currentUserId,

              count:
                markedCount,

              countChange:
                -markedCount,
            }
          );

        }

      } catch (socketError) {

        console.error(
          "Conversation read socket error:",
          socketError.message
        );

      }

      // ======================================
      // Response
      // ======================================

      return res.status(200).json({
        success: true,
        message:
          "Conversation marked as read",
        count:
          markedCount,
      });

    } catch (error) {

      console.error(
        "Mark conversation read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  };


// ======================================
// Get Unread Message Count
// ======================================

exports.getUnreadMessageCount =
  async (req, res) => {

    try {

      const count =
        await Message.countDocuments({
          receiver: req.user.id,
          isRead: false,
        });

      return res.status(200).json({
        success: true,
        count,
      });

    } catch (error) {

      console.error(
        "Get unread message count error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get unread message count",
      });

    }

  };