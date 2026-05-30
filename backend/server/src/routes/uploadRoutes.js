const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      originalname: req.file.originalname
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Upload failed"
    });
  }
});

module.exports = router;