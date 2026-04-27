/**
 *  Content Service
 * Handles content-related business logic
 */

const {
  createContent,
  getContentByTeacher,
  getContentById,
} = require("../models/contentModel");

//  Validate file before upload
const validateFileUpload = (file) => {
  if (!file) {
    throw new Error("File is required");
  }

  const allowed = ["image/jpeg", "image/png", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    throw new Error("Only jpg, png, gif files allowed");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size exceeds 10MB limit");
  }

  return true;
};

//  REASON: Upload content with validation
const uploadContentService = async (data) => {
  validateFileUpload(data.file);

  return await createContent({
    title: data.title,
    subject: data.subject,
    filePath: data.file.path,
    fileName: data.file.filename,
    fileSize: data.file.size,
    fileType: data.file.mimetype,
    userId: data.userId,
    startTime: data.startTime,
    endTime: data.endTime,
    description: data.description,
  });
};

//  REASON: Get teacher's content
const getMyContentService = async (userId) => {
  return await getContentByTeacher(userId);
};

//  REASON: Get content with authorization check
const getContentDetailsService = async (contentId, userId, userRole) => {
  const content = await getContentById(contentId);

  if (!content) {
    throw new Error("Content not found");
  }

  //  Teachers can only see their own content or approved content
  if (userRole === "teacher" && content.uploaded_by !== userId) {
    if (content.status !== "approved") {
      throw new Error("Access denied");
    }
  }

  return content;
};

module.exports = {
  uploadContentService,
  getMyContentService,
  getContentDetailsService,
  validateFileUpload,
};
