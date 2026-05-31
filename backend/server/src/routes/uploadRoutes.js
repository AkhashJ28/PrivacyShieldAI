const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const supabase = require("../config/supabase");

const router = express.Router();

const upload = multer({
  dest: "uploads/",

  limits: {
    fileSize: 100 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const file = req.file;

    // Get file extension
    const fileExtension = path.extname(file.originalname);

    // Generate unique filename
    const uniqueFileName = `${uuidv4()}${fileExtension}`;

    // Read uploaded file
    const fileBuffer = fs.readFileSync(file.path);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(uniqueFileName, fileBuffer, {
        contentType: file.mimetype
      });

    // Handle storage upload error
    if (uploadError) {
      console.log("SUPABASE STORAGE ERROR:", uploadError);

      return res.status(500).json({
        success: false,
        message: "Supabase upload failed"
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(uniqueFileName);

    const publicUrl = publicUrlData.publicUrl;

    // Save file info in database
    const { error: dbError } = await supabase
      .from("documents")
      .insert([
        {
          original_name: file.originalname,
          file_name: uniqueFileName,
          file_url: publicUrl
        }
      ]);

    // Handle database error
    if (dbError) {
      console.log("DATABASE ERROR:", dbError);

      return res.status(500).json({
        success: false,
        message: "Database insert failed"
      });
    }

    // Delete temporary local file
    fs.unlinkSync(file.path);

    // Send success response
    res.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: publicUrl
    });

  } catch (error) {

    console.log("SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Upload failed"
    });

  }
});

module.exports = router;