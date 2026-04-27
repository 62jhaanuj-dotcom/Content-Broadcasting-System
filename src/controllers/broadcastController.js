const {
  getLiveContentService,
  getTeacherLiveContentBySubject,
} = require("../services/schedulingService");

/**
 * ✅ REASON: PUBLIC API - Get live content for specific teacher
 * This endpoint requires NO authentication
 * Returns only approved content that's within time window
 * Implements subject-based rotation
 *
 * EDGE CASES HANDLED:
 * 1. No content available → returns "No content available"
 * 2. Content not scheduled (no start_time/end_time) → not shown
 * 3. Content outside time window → not shown
 * 4. No approved content → returns empty
 */
const getLiveContent = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { subject } = req.query; // Optional subject filter

    //  REASON: Validate teacher ID
    if (!teacherId || isNaN(teacherId)) {
      return res.json({
        message: "No content available",
        data: null,
      });
    }

    const result = await getLiveContentService(
      parseInt(teacherId),
      subject || null,
    );

    //  REASON: Return consistent response format
    if (result.status === "no_content") {
      return res.json({
        message: "No content available",
        data: null,
      });
    }

    res.json({
      message: "Content retrieved successfully",
      data: result.data,
      rotationInfo: result.rotationInfo || null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ REASON: Get all active content for teacher grouped by subject
 * PUBLIC API - No authentication required
 * Shows what content is currently live organized by subject
 */
const getLiveContentByTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId || isNaN(teacherId)) {
      return res.json({
        message: "No content available",
        data: {},
      });
    }

    const result = await getTeacherLiveContentBySubject(parseInt(teacherId));

    if (Object.keys(result).length === 0) {
      return res.json({
        message: "No content available",
        data: {},
      });
    }

    res.json({
      message: "Content retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ REASON: Get live content for specific teacher + subject
 * PUBLIC API - No authentication required
 * Subject-specific rotation
 */
const getLiveContentBySubject = async (req, res, next) => {
  try {
    const { teacherId, subject } = req.params;

    if (!teacherId || isNaN(teacherId)) {
      return res.json({
        message: "No content available",
        data: null,
      });
    }

    if (!subject || !subject.trim()) {
      return res.json({
        message: "No content available",
        data: null,
      });
    }

    const result = await getLiveContentService(
      parseInt(teacherId),
      subject.toLowerCase(),
    );

    if (result.status === "no_content") {
      return res.json({
        message: "No content available",
        data: null,
      });
    }

    res.json({
      message: "Content retrieved successfully",
      data: result.data,
      rotationInfo: result.rotationInfo || null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLiveContent,
  getLiveContentByTeacher,
  getLiveContentBySubject,
};
