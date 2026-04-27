const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const approvalController = require("../controllers/approvalController");

//  REASON: Principal can view all content
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("principal"),
  approvalController.getAll,
);

//  REASON: Principal can view pending content for approval
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("principal"),
  approvalController.getPending,
);

//  REASON: Principal can approve content (tracks approver + timestamp)
router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("principal"),
  approvalController.approve,
);

//  REASON: Principal can reject content with reason
router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("principal"),
  approvalController.reject,
);

module.exports = router;
