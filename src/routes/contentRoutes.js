const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { upload } = require("../middlewares/uploadMiddleware");

const contentController = require("../controllers/contentController");

//   Teacher can upload content (file required)
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware("teacher"),
  upload.single("file"),
  contentController.uploadContent,
);

// Teacher can view their own content uploads
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("teacher"),
  contentController.getMyContent,
);

//   Get content details by ID
router.get("/:id", authMiddleware, contentController.getContentDetails);

module.exports = router;
