const env = require("../config/env");

const errorMiddleware = (err, req, res, next) => {
  // In development, show full error details.
  if (env.NODE_ENV === "development") {
    console.error("ERROR:", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    console.error("ERROR:", {
      message: err.message,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Return clear status codes for common errors.
  if (
    err.message &&
    (err.message.includes("already exists") ||
      err.message.includes("already registered"))
  ) {
    return res.status(409).json({
      message: err.message,
      status: "error",
      code: "DUPLICATE_ENTRY",
    });
  }

  if (err.message && err.message.includes("Invalid credentials")) {
    return res.status(401).json({
      message: err.message,
      status: "error",
      code: "INVALID_AUTH",
    });
  }

  if (err.message && err.message.includes("Access denied")) {
    return res.status(403).json({
      message: err.message,
      status: "error",
      code: "FORBIDDEN",
    });
  }

  if (err.message && err.message.includes("not found")) {
    return res.status(404).json({
      message: err.message,
      status: "error",
      code: "NOT_FOUND",
    });
  }

  if (err.message && err.message.includes("Only")) {
    return res.status(400).json({
      message: err.message,
      status: "error",
      code: "BAD_REQUEST",
    });
  }

  if (err.message && err.message.includes("jpg/png/gif")) {
    return res.status(400).json({
      message: "Only jpg, png, gif files allowed",
      status: "error",
      code: "INVALID_FILE_TYPE",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File size exceeds the allowed limit",
      status: "error",
      code: "FILE_TOO_LARGE",
    });
  }

  const statusCode = err.statusCode || 500;
  const isProduction = env.NODE_ENV === "production";

  res.status(statusCode).json({
    message:
      isProduction && statusCode === 500
        ? "Internal server error"
        : err.message || "Internal server error",
    status: "error",
    code: "INTERNAL_ERROR",
  });
};

module.exports = errorMiddleware;
