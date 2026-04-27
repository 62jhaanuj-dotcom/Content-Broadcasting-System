const { pool } = require("../config/db");

// Create one schedule row.
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

// Find next rotation order for a subject slot.
const getNextRotationOrder = async (slotId) => {
  const res = await pool.query(
    `SELECT COALESCE(MAX(rotation_order), 0) + 1 AS next_order
     FROM schedule
     WHERE slot_id = $1`,
    [slotId],
  );

  return res.rows[0].next_order;
};

// Get schedules for many content ids.
const getScheduleByContentIds = async (contentIds) => {
  if (!contentIds.length) return [];

  const res = await pool.query(
    `SELECT * FROM schedule WHERE content_id = ANY($1) 
     ORDER BY rotation_order ASC`,
    [contentIds],
  );
  return res.rows;
};

// Get schedule rows by slot id.
const getScheduleBySlotId = async (slotId) => {
  const res = await pool.query(
    `SELECT s.* FROM schedule s
     WHERE s.slot_id = $1
     ORDER BY s.rotation_order ASC`,
    [slotId],
  );
  return res.rows;
};

// Get schedule for one content item.
const getScheduleByContentId = async (contentId) => {
  const res = await pool.query(`SELECT * FROM schedule WHERE content_id = $1`, [
    contentId,
  ]);
  return res.rows[0];
};

// Delete schedule for one content item.
const deleteScheduleByContentId = async (contentId) => {
  const res = await pool.query(
    `DELETE FROM schedule WHERE content_id = $1 RETURNING *`,
    [contentId],
  );
  return res.rows;
};

module.exports = {
  createSchedule,
  getNextRotationOrder,
  getScheduleByContentIds,
  getScheduleBySlotId,
  getScheduleByContentId,
  deleteScheduleByContentId,
};
