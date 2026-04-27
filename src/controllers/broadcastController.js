const {
  getLiveContentService,
  getTeacherLiveContentBySubject,
} = require("../services/schedulingService");

const getTeacherIdFromParam = (value) => {
  if (!value) return null;

  if (!isNaN(value)) {
    return parseInt(value);
  }

  const match = value.match(/^teacher-(\d+)$/);

  if (!match) {
    return null;
  }

  return parseInt(match[1]);
};

// Public route: get live content for one teacher.
const getLiveContent = async (req, res, next) => {
  try {
    const teacherId = getTeacherIdFromParam(req.params.teacherId);
    const { subject } = req.query;

    if (!teacherId) {
      return res.json({
        message: "No content available",
        data: null,
      });
    }

    const result = await getLiveContentService(
      teacherId,
      subject || null,
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

// Public route: get all live content for a teacher.
const getLiveContentByTeacher = async (req, res, next) => {
  try {
    const teacherId = getTeacherIdFromParam(req.params.teacherId);

    if (!teacherId) {
      return res.json({
        message: "No content available",
        data: {},
      });
    }

    const result = await getTeacherLiveContentBySubject(teacherId);

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

// Public route: get live content for one teacher and one subject.
const getLiveContentBySubject = async (req, res, next) => {
  try {
    const teacherId = getTeacherIdFromParam(req.params.teacherId);
    const { subject } = req.params;

    if (!teacherId) {
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
      teacherId,
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
