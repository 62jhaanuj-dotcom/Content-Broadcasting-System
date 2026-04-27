const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const approvalController = require("../controllers/approvalController");

// Principal can view all content.
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("principal"),
  approvalController.getAll,
);

// Principal can view pending content.
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("principal"),
  approvalController.getPending,
);

// Principal can approve content.
router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("principal"),
  approvalController.approve,
);

// Principal can reject content with reason.
router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("principal"),
  approvalController.reject,
);

module.exports = router;
