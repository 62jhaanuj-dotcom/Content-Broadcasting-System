const {
  getAllContent,
  getPendingContent,
  approveContent,
  rejectContent,
  getContentById,
} = require("../models/contentModel");

// Get all content for principal dashboard.
const getAll = async (req, res, next) => {
  try {
    const result = await getAllContent();

    res.json({
      message: "All content retrieved",
      data: result,
      count: result.length,
    });
  } catch (err) {
    next(err);
  }
};

// Get only content waiting for approval.
const getPending = async (req, res, next) => {
  try {
    const result = await getPendingContent();

    res.json({
      message: "Pending content retrieved",
      data: result,
      count: result.length,
    });
  } catch (err) {
    next(err);
  }
};

// Approve one content item.
const approve = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await getContentById(id);
    if (!existing) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (existing.status !== "pending") {
      return res.status(400).json({
        message: `Cannot approve content with status: ${existing.status}`,
      });
    }

    const approved = await approveContent(id, req.user.id);

    res.json({
      message: "Content approved successfully",
      data: approved,
    });
  } catch (err) {
    next(err);
  }
};

// Reject one content item.
const reject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const existing = await getContentById(id);
    if (!existing) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (existing.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject content with status: ${existing.status}`,
      });
    }

    const rejected = await rejectContent(id, reason.trim());

    res.json({
      message: "Content rejected successfully",
      data: rejected,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getPending, approve, reject };
