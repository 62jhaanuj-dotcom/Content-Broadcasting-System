const express = require("express");
const router = express.Router();

const broadcastController = require("../controllers/broadcastController");

//  PUBLIC API - No authentication required
// Get live content for specific teacher
// Returns currently active content based on rotation schedule
router.get("/live/:teacherId", broadcastController.getLiveContent);

//   PUBLIC API - Get all live content by teacher grouped by subject
router.get("/teacher/:teacherId", broadcastController.getLiveContentByTeacher);

//   PUBLIC API - Get live content for specific teacher + subject
router.get(
  "/live/:teacherId/:subject",
  broadcastController.getLiveContentBySubject,
);

module.exports = router;
