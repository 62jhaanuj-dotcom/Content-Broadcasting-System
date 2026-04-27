const { Pool } = require("pg");
require("dotenv").config({ quiet: true });

// This creates a PostgreSQL connection pool.
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = { pool };
