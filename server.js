require("dotenv").config();

const app = require("./src/app");
const chalk = require("chalk");
const env = require("./src/config/env");
const { pool } = require("./src/config/db");

const PORT = env.PORT || 5000;

//  ADDED: store server instance
let server;

// DB connection test + start server
pool.query("SELECT NOW()")
  .then(() => {
    console.log(chalk.bgBlue.white(" DB Connected  "));

    // 🔥 CHANGED: assign server to variable
    server = app.listen(PORT, () => {
      console.log(
        chalk.bgGreen.black.bold(` Server running on port ${PORT} `)
      );
    });
  })
  .catch((err) => {
    console.log(chalk.bgRed.white(" DB Connection Failed ❌ "));
    console.error(err);
    process.exit(1);
  });


// ❌ OLD (no change needed here, keep as is)
process.on("uncaughtException", (err) => {
  console.log(chalk.bgRed.white(" UNCAUGHT EXCEPTION 💥 "));
  console.log(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log(chalk.bgRed.white(" UNHANDLED REJECTION 💥 "));
  console.log(err);
  process.exit(1);
});


// 🔥 ADDED: Graceful shutdown
process.on("SIGINT", async () => {
  console.log(chalk.bgYellow.black(" Shutting down... "));

  await pool.end(); // DB close

  if (server) {
    server.close(() => {
      console.log(chalk.bgYellow.black(" Server closed "));
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});