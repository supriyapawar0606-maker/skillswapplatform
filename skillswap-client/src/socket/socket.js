import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,

  transports: [
    "websocket",
    "polling",
  ],

  withCredentials: true,
});

// ======================================================
// Connected
// ======================================================

socket.on(
  "connect",
  () => {
    console.log(
      "🟢 Socket.IO connected:",
      socket.id
    );
  }
);

// ======================================================
// Connection Error
// ======================================================

socket.on(
  "connect_error",
  (error) => {
    console.error(
      "❌ Socket.IO connection error:",
      error.message
    );
  }
);

// ======================================================
// Disconnect
// ======================================================

socket.on(
  "disconnect",
  (reason) => {
    console.log(
      "🔴 Socket.IO disconnected:",
      reason
    );
  }
);

export default socket;