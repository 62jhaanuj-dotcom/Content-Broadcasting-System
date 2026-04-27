const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const broadcastRoutes = require("./routes/broadcastRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// Helmet adds basic security headers.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
  }),
);

// Rate limit protects the API from too many requests.
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});
app.use("/api/", limiter);

// CORS controls which frontend URLs can use this API.
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = env.ALLOWED_ORIGINS;

    // Tools like Postman and curl do not send an origin.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Allow JSON request body.
app.use(express.json());

// Show request method and URL during development.
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Make uploaded files public.
app.use("/uploads", express.static("src/uploads"));

// API routes.
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/approval", approvalRoutes);
app.use("/api/broadcast", broadcastRoutes);
app.use("/content", broadcastRoutes);

// Simple health check route.
app.get("/", (req, res) => {
  res.json({
    message: "Content Broadcast API is running",
    version: "1.0.0",
    status: "healthy",
  });
});

// Route not found.
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
    path: req.path,
  });
});

// Error handler should stay at the end.
app.use(errorMiddleware);

module.exports = app;
