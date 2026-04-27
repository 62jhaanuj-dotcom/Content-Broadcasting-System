const { pool } = require("../config/db");

// Create or get a content slot for a subject.
const createSlot = async (subject) => {
  const res = await pool.query(
    `INSERT INTO content_slots (subject)
     VALUES ($1) 
     ON CONFLICT (subject) DO UPDATE SET subject=$1
     RETURNING *`,
    [subject],
  );
  return res.rows[0];
};

// Find slot by subject.
const findSlotBySubject = async (subject) => {
  const res = await pool.query(`SELECT * FROM content_slots WHERE subject=$1`, [
    subject,
  ]);
  return res.rows[0];
};

// Get all content slots.
const getAllSlots = async () => {
  const res = await pool.query(
    `SELECT * FROM content_slots ORDER BY subject ASC`,
  );
  return res.rows;
};

// Get slot for subject. If missing, create it.
const getOrCreateSlot = async (subject) => {
  let slot = await findSlotBySubject(subject);

  if (!slot) {
    slot = await createSlot(subject);
  }

  return slot;
};

module.exports = {
  createSlot,
  findSlotBySubject,
  getAllSlots,
  getOrCreateSlot,
};
