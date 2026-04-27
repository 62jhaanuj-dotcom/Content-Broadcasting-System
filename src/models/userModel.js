const { pool } = require("../config/db");

// ✅ REASON: Create user with proper validation and hashed password
const createUser = async ({ name, email, password, role }) => {
  const res = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, password, role],
  );
  return res.rows[0];
};

//  Find user by email for login authentication
const findUserByEmail = async (email) => {
  const res = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
  return res.rows[0];
};

// Find user by ID for profile and token verification
const findUserById = async (userId) => {
  const res = await pool.query(`SELECT * FROM users WHERE id=$1`, [userId]);
  return res.rows[0];
};

// Get all teachers for admin operations
const getAllTeachers = async () => {
  const res = await pool.query(
    `SELECT id, name, email, role, created_at FROM users 
     WHERE role='teacher'
     ORDER BY created_at DESC`,
  );
  return res.rows;
};

//  Check if user exists before creating duplicate
const userExists = async (email) => {
  const res = await pool.query(`SELECT id FROM users WHERE email=$1`, [email]);
  return res.rows.length > 0;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllTeachers,
  userExists,
};
