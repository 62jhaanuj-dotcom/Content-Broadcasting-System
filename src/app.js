const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const broadcastRoutes = require("./routes/broadcastRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

//  Enable CORS for public API access
app.use(cors());

//  Parse JSON request bodies
app.use(express.json());

//  Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//  Serve uploaded files statically
app.use("/uploads", express.static("src/uploads"));

//  Mount all API routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/approval", approvalRoutes);
app.use("/api/broadcast", broadcastRoutes);

//  Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Content Broadcast API is running",
    version: "1.0.0",
    status: "healthy",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
    path: req.path,
  });
});

//  Error middleware (MUST be last)
app.use(errorMiddleware);

module.exports = app;
