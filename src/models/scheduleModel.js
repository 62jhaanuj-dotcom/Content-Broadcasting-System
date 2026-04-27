const { pool } = require("../config/db");

// ✅ REASON: Create schedule entry for content rotation tracking
const createSchedule = async ({
  contentId,
  slotId,
  rotationOrder,
  duration,
}) => {
  const res = await pool.query(
    `INSERT INTO schedule (content_id, slot_id, rotation_order, duration)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [contentId, slotId, rotationOrder, duration],
  );
  return res.rows[0];
};

//  Get all schedules for specific content IDs for rotation logic
const getScheduleByContentIds = async (contentIds) => {
  if (!contentIds.length) return [];

  const res = await pool.query(
    `SELECT * FROM schedule WHERE content_id = ANY($1) 
     ORDER BY rotation_order ASC`,
    [contentIds],
  );
  return res.rows;
};

//  REASON: Get schedule by subject for subject-based rotation
const getScheduleBySlotId = async (slotId) => {
  const res = await pool.query(
    `SELECT s.* FROM schedule s
     WHERE s.slot_id = $1
     ORDER BY s.rotation_order ASC`,
    [slotId],
  );
  return res.rows;
};

//  REASON: Get single schedule entry for specific content
const getScheduleByContentId = async (contentId) => {
  const res = await pool.query(`SELECT * FROM schedule WHERE content_id = $1`, [
    contentId,
  ]);
  return res.rows[0];
};

//  REASON: Delete schedule when content is rejected or removed
const deleteScheduleByContentId = async (contentId) => {
  const res = await pool.query(
    `DELETE FROM schedule WHERE content_id = $1 RETURNING *`,
    [contentId],
  );
  return res.rows;
};

module.exports = {
  createSchedule,
  getScheduleByContentIds,
  getScheduleBySlotId,
  getScheduleByContentId,
  deleteScheduleByContentId,
};
