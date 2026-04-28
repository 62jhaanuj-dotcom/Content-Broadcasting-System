const { Pool } = require("pg");
const env = require("./env");

const poolConfig = {
  connectionString: env.DATABASE_URL,
};

if (env.DB_SSL) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// This creates a PostgreSQL connection pool.
const pool = new Pool(poolConfig);

module.exports = { pool };
