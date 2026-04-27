/**
 *  REASON: Centralized error handling middleware
 * Catches all errors from routes and services
 * Returns consistent error response format
 * Logs errors for debugging
 */
const errorMiddleware = (err, req, res, next) => {
  console.error("❌ ERROR:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  //  REASON: Handle specific error types for better UX
  if (err.message && err.message.includes("already exists")) {
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

  //  REASON: Handle multer file upload errors
  if (err.message && err.message.includes("jpg/png/gif")) {
    return res.status(400).json({
      message: "Only jpg, png, gif files allowed",
      status: "error",
      code: "INVALID_FILE_TYPE",
    });
  }

  //  REASON: Default error response
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
    status: "error",
    code: "INTERNAL_ERROR",
  });
};

module.exports = errorMiddleware;
