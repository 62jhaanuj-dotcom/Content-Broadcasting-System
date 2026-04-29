require("dotenv").config();

const app = require("./src/app");
const env = require("./src/config/env");
const { pool } = require("./src/config/db");

const PORT = env.PORT || 5000;
let server;
let shuttingDown = false;

const log = {
  info: (message) => console.log(message),
  error: (message, error) => {
    console.error(message);
    if (error) {
      console.error(error);
    }
  },
};

const startServer = async () => {
  log.info(`Starting server in ${env.NODE_ENV} mode...`);

  try {
    await pool.query("SELECT 1");
    log.info("DB connected");

    server = app.listen(PORT, () => {
      log.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    log.error("DB connection failed", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  log.info(`${signal} received. Shutting down gracefully...`);

  const forceCloseTimer = setTimeout(() => {
    log.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      log.info("Server closed");
    }

    await pool.end();
    log.info("Database connection closed");
    clearTimeout(forceCloseTimer);
    process.exit(0);
  } catch (error) {
    clearTimeout(forceCloseTimer);
    log.error("Error during graceful shutdown", error);
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  log.error("Uncaught exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  log.error("Unhandled rejection", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

void startServer();
