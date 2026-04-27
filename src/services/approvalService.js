/**
 *  Approval Service
 * Handles all approval-related business logic
 */

const {
  getPendingContent,
  getAllContent,
  getContentById,
} = require("../models/contentModel");

//  Get dashboard stats for principal
const getApprovalStats = async () => {
  const pending = await getPendingContent();
  const all = await getAllContent();

  return {
    total: all.length,
    pending: pending.length,
    approved: all.filter((c) => c.status === "approved").length,
    rejected: all.filter((c) => c.status === "rejected").length,
  };
};

//  Validate content can be approved/rejected
const validateApprovalAction = async (contentId) => {
  const content = await getContentById(contentId);

  if (!content) {
    throw new Error("Content not found");
  }

  if (content.status !== "pending") {
    throw new Error(`Cannot modify content with status: ${content.status}`);
  }

  return content;
};

module.exports = {
  getApprovalStats,
  validateApprovalAction,
};
