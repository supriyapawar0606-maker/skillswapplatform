require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

// ======================================================
// Routes
// ======================================================

const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const swapRoutes = require("./routes/swapRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const workshopRoutes = require("./routes/workshopRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ======================================================
// Socket.IO
// ======================================================

const {
  initializeSocket,
} = require("./socket/socket");

// ======================================================
// App
// ======================================================

const app = express();

const server =
  http.createServer(app);

// ======================================================
// Environment
// ======================================================

const PORT =
  process.env.PORT || 5000;

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

// Supports a single origin or a comma-separated list (e.g. local + deployed
// frontend URLs) so the same server works in dev and production.
const ALLOWED_ORIGINS = CLIENT_URL.split(",").map((o) => o.trim());

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Vite auto-increments the port (5173, 5174, 5175...) whenever the previous
// one is busy, so in development we allow any localhost port instead of
// forcing CLIENT_URL to be kept in sync every time. Production still uses
// the strict ALLOWED_ORIGINS list only.
const isAllowedOrigin = (origin) => {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (!IS_PRODUCTION && /^http:\/\/localhost:\d+$/.test(origin)) return true;
  return false;
};

// ======================================================
// Database
// ======================================================

connectDB();

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header, e.g. curl/health checks)
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      // Deny without throwing — an uncaught throw here would fall through
      // to the global error handler and return a misleading 500 instead of
      // a clean CORS rejection.
      return callback(null, false);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
  })
);

// ======================================================
// Middleware
// ======================================================

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  cookieParser()
);

// ======================================================
// Test Route
// ======================================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "🚀 SkillSwap Backend API Running",
    });
  }
);

// ======================================================
// API Routes
// ======================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/skills",
  skillRoutes
);

app.use(
  "/api/swaps",
  swapRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/bookmarks",
  bookmarkRoutes
);

app.use(
  "/api/workshops",
  workshopRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/schedule",
  scheduleRoutes
);

app.use(
  "/api/leaderboard",
  leaderboardRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

// ======================================================
// 404 Handler
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// Global Error Handler
// ======================================================

app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

// ======================================================
// Initialize Socket.IO
// ======================================================

initializeSocket(server);

// ======================================================
// Start Server
// ======================================================

server.listen(
  PORT,
  () => {
    console.log(
      "=========================================="
    );

    console.log(
      "🚀 SkillSwap Backend"
    );

    console.log(
      `🌐 http://localhost:${PORT}`
    );

    console.log(
      `🔗 Client: ${CLIENT_URL}`
    );

    console.log(
      "=========================================="
    );
  }
);