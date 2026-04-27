const multer = require("multer");
const path = require("path");
const env = require("../config/env");

const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return cb(new Error("Only jpg/png/gif allowed"));
    }

    cb(null, true);
  },
});

module.exports = { upload };
