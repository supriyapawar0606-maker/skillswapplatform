const { Server } = require("socket.io");

let io = null;

// ======================================================
// Online Users
// ======================================================

const onlineUsers = new Map();

// ======================================================
// Video Rooms
// roomId -> Set(socketId)
// ======================================================

const videoRooms = new Map();

// ======================================================
// Initialize Socket.IO
// ======================================================

const initializeSocket = (server) => {
  const allowedOrigins = (
    process.env.CLIENT_URL || "http://localhost:5173"
  )
    .split(",")
    .map((o) => o.trim());

  const isProduction = process.env.NODE_ENV === "production";

  // Same reasoning as server.js: Vite's dev port shifts around
  // (5173, 5174, 5175...), so allow any localhost port outside production.
  const corsOrigin = (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (!isProduction && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  };

  io = new Server(server, {
    cors: {
      origin: corsOrigin,

      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ],

      credentials: true,
    },

    // Use WebSocket + polling for compatibility
    transports: ["websocket", "polling"],
  });

  console.log("✅ Socket.IO initialized");

  // ====================================================
  // SOCKET CONNECTION
  // ====================================================

  io.on("connection", (socket) => {
    console.log(
      "🟢 Socket connected:",
      socket.id
    );

    // ==================================================
    // REGISTER USER
    // ==================================================

    socket.on("join", (userId) => {
      if (!userId) {
        return;
      }

      const id = String(userId);

      onlineUsers.set(id, socket.id);

      socket.userId = id;

      console.log(
        `👤 User ${id} joined Socket.IO`
      );

      io.emit(
        "onlineUsers",
        Array.from(onlineUsers.keys())
      );
    });

    // ==================================================
    // TYPING
    // ==================================================

    socket.on(
      "typing",
      ({ sender, receiver } = {}) => {
        if (!sender || !receiver) {
          return;
        }

        const receiverSocket =
          onlineUsers.get(
            String(receiver)
          );

        if (receiverSocket) {
          io.to(receiverSocket).emit(
            "typing",
            {
              sender,
            }
          );
        }
      }
    );

    // ==================================================
    // STOP TYPING
    // ==================================================

    socket.on(
      "stopTyping",
      ({ sender, receiver } = {}) => {
        if (!sender || !receiver) {
          return;
        }

        const receiverSocket =
          onlineUsers.get(
            String(receiver)
          );

        if (receiverSocket) {
          io.to(receiverSocket).emit(
            "stopTyping",
            {
              sender,
            }
          );
        }
      }
    );

    // ==================================================
    // JOIN VIDEO ROOM
    // ==================================================

    socket.on(
      "join-video-room",
      ({ roomId } = {}) => {
        if (!roomId) {
          console.warn(
            "⚠️ Video room ID missing"
          );

          return;
        }

        const room = String(roomId);

        // ----------------------------------------------
        // Create room
        // ----------------------------------------------

        if (!videoRooms.has(room)) {
          videoRooms.set(
            room,
            new Set()
          );
        }

        const participants =
          videoRooms.get(room);

        // ----------------------------------------------
        // Maximum 2 participants
        // ----------------------------------------------

        if (
          participants.size >= 2 &&
          !participants.has(socket.id)
        ) {
          console.log(
            `🚫 Video room ${room} is full`
          );

          socket.emit(
            "video-room-full"
          );

          return;
        }

        // ----------------------------------------------
        // Already inside
        // ----------------------------------------------

        if (
          participants.has(socket.id)
        ) {
          console.log(
            `⚠️ ${socket.id} already in room ${room}`
          );

          return;
        }

        // ----------------------------------------------
        // Existing participant
        // ----------------------------------------------

        const existingParticipant =
          Array.from(
            participants
          )[0] || null;

        // ----------------------------------------------
        // Join Socket.IO room
        // ----------------------------------------------

        socket.join(room);

        socket.videoRoomId = room;

        participants.add(socket.id);

        console.log(
          `📹 ${socket.id} joined video room ${room}`
        );

        console.log(
          `👥 Participants: ${participants.size}`
        );

        // ==============================================
        // FIRST USER
        // ==============================================

        if (!existingParticipant) {
          socket.emit(
            "video-room-role",
            {
              role: "waiting",
            }
          );

          console.log(
            `⏳ ${socket.id} waiting for participant`
          );

          return;
        }

        // ==============================================
        // SECOND USER
        // ==============================================

        socket.emit(
          "video-room-role",
          {
            role: "receiver",
            otherSocketId:
              existingParticipant,
          }
        );

        // ==============================================
        // FIRST USER = INITIATOR
        // ==============================================

        io.to(
          existingParticipant
        ).emit(
          "video-room-role",
          {
            role: "initiator",
            otherSocketId:
              socket.id,
          }
        );

        console.log(
          `🎯 ${existingParticipant} = initiator`
        );

        console.log(
          `🎯 ${socket.id} = receiver`
        );
      }
    );

    // ==================================================
    // WEBRTC OFFER
    // ==================================================

    socket.on(
      "webrtc-offer",
      ({
        roomId,
        offer,
        targetSocketId,
      } = {}) => {
        if (!roomId || !offer) {
          return;
        }

        console.log(
          `📤 WebRTC offer from ${socket.id}`
        );

        // ----------------------------------------------
        // Direct target
        // ----------------------------------------------

        if (targetSocketId) {
          io.to(
            targetSocketId
          ).emit(
            "webrtc-offer",
            {
              offer,
              sender: socket.id,
            }
          );

          return;
        }

        // ----------------------------------------------
        // Room fallback
        // ----------------------------------------------

        socket
          .to(String(roomId))
          .emit(
            "webrtc-offer",
            {
              offer,
              sender: socket.id,
            }
          );
      }
    );

    // ==================================================
    // WEBRTC ANSWER
    // ==================================================

    socket.on(
      "webrtc-answer",
      ({
        roomId,
        answer,
        targetSocketId,
      } = {}) => {
        if (!roomId || !answer) {
          return;
        }

        console.log(
          `📤 WebRTC answer from ${socket.id}`
        );

        // ----------------------------------------------
        // Direct target
        // ----------------------------------------------

        if (targetSocketId) {
          io.to(
            targetSocketId
          ).emit(
            "webrtc-answer",
            {
              answer,
              sender: socket.id,
            }
          );

          return;
        }

        // ----------------------------------------------
        // Room fallback
        // ----------------------------------------------

        socket
          .to(String(roomId))
          .emit(
            "webrtc-answer",
            {
              answer,
              sender: socket.id,
            }
          );
      }
    );

    // ==================================================
    // WEBRTC ICE CANDIDATE
    // ==================================================

    socket.on(
      "webrtc-ice-candidate",
      ({
        roomId,
        candidate,
        targetSocketId,
      } = {}) => {
        if (!roomId || !candidate) {
          return;
        }

        console.log(
          `🧊 ICE candidate from ${socket.id}`
        );

        // ----------------------------------------------
        // Direct target
        // ----------------------------------------------

        if (targetSocketId) {
          io.to(
            targetSocketId
          ).emit(
            "webrtc-ice-candidate",
            {
              candidate,
              sender: socket.id,
            }
          );

          return;
        }

        // ----------------------------------------------
        // Room fallback
        // ----------------------------------------------

        socket
          .to(String(roomId))
          .emit(
            "webrtc-ice-candidate",
            {
              candidate,
              sender: socket.id,
            }
          );
      }
    );

    // ==================================================
    // LEAVE VIDEO ROOM
    // ==================================================

    socket.on(
      "leave-video-room",
      ({ roomId } = {}) => {
        if (!roomId) {
          return;
        }

        leaveVideoRoom(
          socket,
          String(roomId)
        );
      }
    );

    // ==================================================
    // DISCONNECT
    // ==================================================

    socket.on(
      "disconnect",
      (reason) => {
        console.log(
          "🔴 Socket disconnected:",
          socket.id,
          reason
        );

        // ----------------------------------------------
        // Remove online user
        // ----------------------------------------------

        if (socket.userId) {
          const currentSocket =
            onlineUsers.get(
              socket.userId
            );

          if (
            currentSocket === socket.id
          ) {
            onlineUsers.delete(
              socket.userId
            );
          }
        }

        // ----------------------------------------------
        // Remove video participant
        // ----------------------------------------------

        if (socket.videoRoomId) {
          leaveVideoRoom(
            socket,
            socket.videoRoomId
          );
        }

        // ----------------------------------------------
        // Update online users
        // ----------------------------------------------

        io.emit(
          "onlineUsers",
          Array.from(
            onlineUsers.keys()
          )
        );
      }
    );
  });
};

// ======================================================
// Leave Video Room
// ======================================================

const leaveVideoRoom = (
  socket,
  roomId
) => {
  if (!roomId) {
    return;
  }

  const room = String(roomId);

  const participants =
    videoRooms.get(room);

  if (!participants) {
    return;
  }

  // ----------------------------------------------
  // Remove participant
  // ----------------------------------------------

  participants.delete(
    socket.id
  );

  socket.leave(room);

  socket.videoRoomId = null;

  console.log(
    `👋 ${socket.id} left video room ${room}`
  );

  // ----------------------------------------------
  // Notify remaining participant
  // ----------------------------------------------

  socket.to(room).emit(
    "user-left",
    {
      socketId: socket.id,
    }
  );

  // ----------------------------------------------
  // Delete empty room
  // ----------------------------------------------

  if (
    participants.size === 0
  ) {
    videoRooms.delete(room);

    console.log(
      `🗑️ Video room ${room} deleted`
    );
  }
};

// ======================================================
// Get Socket.IO
// ======================================================

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized"
    );
  }

  return io;
};

// ======================================================
// Get Online Users
// ======================================================

const getOnlineUsers = () => {
  return onlineUsers;
};

// ======================================================
// Get Video Rooms
// ======================================================

const getVideoRooms = () => {
  return videoRooms;
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  initializeSocket,
  getIO,
  getOnlineUsers,
  getVideoRooms,
};