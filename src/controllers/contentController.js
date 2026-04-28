const {
  createContent,
  getContentByTeacher,
  getContentById,
} = require("../models/contentModel");
const { getOrCreateSlot } = require("../models/contentSlotModel");
const {
  createSchedule,
  getNextRotationOrder,
} = require("../models/scheduleModel");

// Upload new content.
const uploadContent = async (req, res, next) => {
  try {
    const {
      title,
      subject,
      startTime,
      endTime,
      description,
      rotationDuration,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: "Subject is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    if ((startTime && !endTime) || (!startTime && endTime)) {
      return res.status(400).json({
        message: "Start time and end time must be provided together",
      });
    }

    // If dates are provided, end time should be after start time.
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

    const duration = parseInt(rotationDuration || "5");

    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        message: "Rotation duration must be a positive number",
      });
    }

    const cleanSubject = subject.trim().toLowerCase();

    const content = await createContent({
      title: title.trim(),
      subject: cleanSubject,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      userId: req.user.id,
      startTime: startTime || null,
      endTime: endTime || null,
      description: description || null,
    });

    const slot = await getOrCreateSlot(cleanSubject);
    const rotationOrder = await getNextRotationOrder(slot.id);

    const schedule = await createSchedule({
      contentId: content.id,
      slotId: slot.id,
      rotationOrder,
      duration,
    });

    res.status(201).json({
      message: "Content uploaded successfully",
      data: {
        ...content,
        schedule,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get content uploaded by the logged-in teacher.
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

// Get one content item by id.
const getContentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const content = await getContentById(id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Teachers can view only their own content. Principal can view any content.
    if (req.user.role === "teacher" && content.uploaded_by !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
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
