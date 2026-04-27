require("dotenv").config();

const env = {
  PORT: process.env.PORT || 5000,

  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,

  JWT_SECRET: process.env.JWT_SECRET,

  NODE_ENV: process.env.NODE_ENV || "development",
};

module.exports = env;