const { pool } = require("../config/db");

// Create a new user.
const createUser = async ({ name, email, password, role }) => {
  const res = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, password, role],
  );
  return res.rows[0];
};

// Find user by email.
const findUserByEmail = async (email) => {
  const res = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
  return res.rows[0];
};

// Find user by id.
const findUserById = async (userId) => {
  const res = await pool.query(`SELECT * FROM users WHERE id=$1`, [userId]);
  return res.rows[0];
};

// Get all teacher users.
const getAllTeachers = async () => {
  const res = await pool.query(
    `SELECT id, name, email, role, created_at FROM users 
     WHERE role='teacher'
     ORDER BY created_at DESC`,
  );
  return res.rows;
};

// Check if email already exists.
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
