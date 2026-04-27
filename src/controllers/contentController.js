const {
  createContent,
  getContentByTeacher,
  getContentById,
} = require("../models/contentModel");

//  Comprehensive validation for content upload
const uploadContent = async (req, res, next) => {
  try {
    const { title, subject, startTime, endTime, description } = req.body;

    //  REASON: Validate all required fields before processing
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: "Subject is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    //  REASON: Validate time range if provided
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      if (start >= end) {
        return res
          .status(400)
          .json({ message: "End time must be after start time" });
      }
    }

    //  REASON: Extract file metadata for storage
    const content = await createContent({
      title: title.trim(),
      subject: subject.trim().toLowerCase(),
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      userId: req.user.id,
      startTime: startTime || null,
      endTime: endTime || null,
      description: description || null,
    });

    res.status(201).json({
      message: "Content uploaded successfully",
      data: content,
    });
  } catch (err) {
    next(err);
  }
};

//  REASON: Get all content uploaded by teacher with status
const getMyContent = async (req, res, next) => {
  try {
    const data = await getContentByTeacher(req.user.id);

    res.json({
      message: "Content retrieved successfully",
      data,
      count: data.length,
    });
  } catch (err) {
    next(err);
  }
};

//  REASON: Get specific content details
const getContentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const content = await getContentById(id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    //  REASON: Authorization check - teachers can only view their own content or approved content
    if (req.user.role === "teacher" && content.uploaded_by !== req.user.id) {
      if (content.status !== "approved") {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json({
      message: "Content details retrieved",
      data: content,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadContent,
  getMyContent,
  getContentDetails,
};
