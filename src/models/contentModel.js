const { pool } = require("../config/db");

//  Complete content record with all fields including file metadata
const createContent = async ({
  title,
  subject,
  filePath,
  fileName,
  fileSize,
  fileType,
  userId,
  startTime,
  endTime,
  description,
}) => {
  const res = await pool.query(
    `INSERT INTO content 
     (title, description, subject, file_path, file_type, file_size, uploaded_by, status, start_time, end_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      title,
      description || null,
      subject,
      filePath,
      fileType,
      fileSize,
      userId,
      "pending",
      startTime || null,
      endTime || null,
    ],
  );
  return res.rows[0];
};

//  Get only approved content from specific teacher
const getApprovedContentByTeacher = async (teacherId) => {
  const res = await pool.query(
    `SELECT * FROM content 
     WHERE uploaded_by=$1 AND status='approved'
     ORDER BY created_at DESC`,
    [teacherId],
  );
  return res.rows;
};

//  Get content by teacher for viewing their own uploads
const getContentByTeacher = async (teacherId) => {
  const res = await pool.query(
    `SELECT * FROM content 
     WHERE uploaded_by=$1
     ORDER BY created_at DESC`,
    [teacherId],
  );
  return res.rows;
};

//  REASON: Get all content for Principal's approval dashboard
const getAllContent = async () => {
  const res = await pool.query(
    `SELECT c.*, u.name as teacher_name FROM content c
     LEFT JOIN users u ON c.uploaded_by = u.id
     ORDER BY c.created_at DESC`,
  );
  return res.rows;
};

//  REASON: Get pending content for approval workflow
const getPendingContent = async () => {
  const res = await pool.query(
    `SELECT c.*, u.name as teacher_name FROM content c
     LEFT JOIN users u ON c.uploaded_by = u.id
     WHERE c.status='pending'
     ORDER BY c.created_at ASC`,
  );
  return res.rows;
};

//  REASON: Approve content and track approver and approval time
const approveContent = async (contentId, principalId) => {
  const res = await pool.query(
    `UPDATE content 
     SET status='approved', approved_by=$1, approved_at=CURRENT_TIMESTAMP
     WHERE id=$2
     RETURNING *`,
    [principalId, contentId],
  );
  return res.rows[0];
};

//  REASON: Reject content with reason for audit trail
const rejectContent = async (contentId, reason) => {
  const res = await pool.query(
    `UPDATE content 
     SET status='rejected', rejection_reason=$1
     WHERE id=$2
     RETURNING *`,
    [reason, contentId],
  );
  return res.rows[0];
};

//  REASON: Get approved content by subject for rotation logic
const getApprovedContentBySubject = async (subject) => {
  const res = await pool.query(
    `SELECT c.* FROM content c
     WHERE c.subject=$1 AND c.status='approved'
     AND c.start_time <= CURRENT_TIMESTAMP
     AND c.end_time >= CURRENT_TIMESTAMP
     ORDER BY c.created_at ASC`,
    [subject],
  );
  return res.rows;
};

//  REASON: Get approved live content for teacher + subject combination
const getApprovedLiveContentByTeacherAndSubject = async (
  teacherId,
  subject,
) => {
  const res = await pool.query(
    `SELECT * FROM content 
     WHERE uploaded_by=$1 AND subject=$2 AND status='approved'
     AND start_time <= CURRENT_TIMESTAMP
     AND end_time >= CURRENT_TIMESTAMP
     ORDER BY created_at ASC`,
    [teacherId, subject],
  );
  return res.rows;
};

//  REASON: Get single content by ID for detail view
const getContentById = async (contentId) => {
  const res = await pool.query(
    `SELECT c.*, u.name as teacher_name FROM content c
     LEFT JOIN users u ON c.uploaded_by = u.id
     WHERE c.id=$1`,
    [contentId],
  );
  return res.rows[0];
};

module.exports = {
  createContent,
  getApprovedContentByTeacher,
  getContentByTeacher,
  getAllContent,
  getPendingContent,
  approveContent,
  rejectContent,
  getApprovedContentBySubject,
  getApprovedLiveContentByTeacherAndSubject,
  getContentById,
};
