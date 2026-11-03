require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const initChatSocket = require("./sockets/chatSocket");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const matchRoutes = require("./routes/matchRoutes");
const swapRoutes = require("./routes/swapRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
});

// Make io accessible inside route controllers via req.app.get('io')
app.set("io", io);

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// ---- Health check ----
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "SkillSwap API",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
    },
  });
});

// ---- Routes ----
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/skills", skillRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/swaps", swapRoutes);
app.use("/api/v1/conversations", messageRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/admin", adminRoutes);

// ---- 404 handler ----
app.use((req, res) => {
  res
    .status(404)
    .json({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
});

// ---- Centralized error handler ----
app.use((err, req, res, next) => {
  console.error("[Unhandled Error]", err);
  res
    .status(500)
    .json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: err.message || "Something went wrong",
      },
    });
});

// ---- Socket.io ----
initChatSocket(io);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(
      `[Server] SkillSwap API + Socket.io running on http://localhost:${PORT}`,
    );
  });
});
