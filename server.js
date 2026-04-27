require("dotenv").config({ quiet: true });

const app = require("./src/app");
const env = require("./src/config/env");
const { pool } = require("./src/config/db");

const PORT = env.PORT || 5000;
let server;

console.log(`Starting server in ${env.NODE_ENV} mode...`);

// First check database connection, then start the server.
pool.query("SELECT NOW()")
  .then(() => {
    console.log("Database connected");

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed");
    console.error(err);
    process.exit(1);
  });

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception");
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection");
  console.error(err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received - graceful shutdown initiated");
  gracefulShutdown();
});

process.on("SIGINT", () => {
  console.log("SIGINT received - graceful shutdown initiated");
  gracefulShutdown();
});

function gracefulShutdown() {
  console.log("Shutting down gracefully...");

  if (!server) {
    closeDatabaseAndExit(0);
    return;
  }

  server.close(() => {
    console.log("Server closed");
    closeDatabaseAndExit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000).unref();
}

async function closeDatabaseAndExit(code) {
  try {
    await pool.end();
    console.log("Database connection closed");
  } catch (err) {
    console.error("Error closing database connection:", err);
  }

  console.log("Graceful shutdown complete");
  process.exit(code);
}
