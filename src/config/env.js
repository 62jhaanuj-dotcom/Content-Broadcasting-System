require("dotenv").config({ quiet: true });

const defaultOrigins = ["http://localhost:3000", "http://localhost:5000"];

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : defaultOrigins,
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "10485760"),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
  ),
};

// These values are required when app is running in production.
if (env.NODE_ENV === "production") {
  const required = ["SUPABASE_DB_URL", "JWT_SECRET"];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  if (env.JWT_SECRET.length < 32) {
    console.warn(
      "WARNING: JWT_SECRET is weak. Use at least 32 characters.",
    );
  }
}

module.exports = env;
