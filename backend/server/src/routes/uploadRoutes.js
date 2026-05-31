const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { spawn } = require("child_process");
const {
  createAuditLog,
  createDocument,
  supabaseEnabled,
  uploadToSupabaseStorage,
} = require("../services/dataStore");

const router = express.Router();
const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,

  limits: {
    fileSize: 100 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
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

function runBlurProcess(inputPath, outputPath) {
  const pythonScriptPath = path.join(__dirname, "../../../ai-processing/blur2.py");
  const commands = process.platform === "win32" ? [["py", ["-3"]], ["python", []]] : [["python3", []], ["python", []]];

  return new Promise((resolve, reject) => {
    let commandIndex = 0;

    const runNext = () => {
      if (commandIndex >= commands.length) {
        reject(new Error("Python runtime not found. Install Python 3 and backend/ai-processing requirements."));
        return;
      }

      const [command, baseArgs] = commands[commandIndex];
      commandIndex += 1;
      const child = spawn(command, [...baseArgs, pythonScriptPath, inputPath, outputPath], {
        cwd: path.dirname(pythonScriptPath),
      });
      let stderr = "";

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("error", () => {
        runNext();
      });

      child.on("close", (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
          resolve();
          return;
        }

        reject(new Error(stderr.trim() || `Python blur process exited with code ${code}`));
      });
    };

    runNext();
  });
}

router.post("/", upload.single("file"), async (req, res) => {
  let uploadedTempPath = null;
  let blurredFilePath = null;

  try {

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const file = req.file;
    uploadedTempPath = file.path;
    const officerName = req.body.officer_name || "Unknown Officer";

    // Get file extension
    const fileExtension = path.extname(file.originalname);
    const isVideo = file.mimetype.startsWith("video/");
    const processedExtension = isVideo ? ".mp4" : fileExtension || ".jpg";
    const processingInputPath = `${file.path}${fileExtension || (isVideo ? ".mp4" : ".jpg")}`;
    fs.renameSync(file.path, processingInputPath);
    uploadedTempPath = processingInputPath;

    // Generate unique filename
    const uniqueFileName = `${uuidv4()}${processedExtension}`;

    const blurredFileName = `blurred_${uniqueFileName}`;
    blurredFilePath = path.join(uploadDir, blurredFileName);

    await runBlurProcess(processingInputPath, blurredFilePath);

    const contentType = isVideo ? "video/mp4" : file.mimetype;
    let publicUrl = `${req.protocol}://${req.get("host")}/uploads/${blurredFileName}`;

    if (supabaseEnabled) {
      const fileBuffer = fs.readFileSync(blurredFilePath);
      publicUrl = await uploadToSupabaseStorage({
        fileName: blurredFileName,
        fileBuffer,
        contentType,
      });
    }

    // Save file info in database
    const document = await createDocument({
      original_name: file.originalname,
      file_name: blurredFileName,
      file_url: publicUrl,
      content_type: contentType,
      media_type: isVideo ? "video" : "image",
      processing_status: "completed"
    });

    // Insert Audit Log
    await createAuditLog({
      action: `${isVideo ? "Video" : "Image"} Uploaded`,
      admin_name: officerName,
      details: `Uploaded and blurred ${file.originalname}`,
      request_id: null
    });

    // Delete temporary local file
    if (fs.existsSync(processingInputPath)) {
      fs.unlinkSync(processingInputPath);
    }
    if (supabaseEnabled && fs.existsSync(blurredFilePath)) {
      fs.unlinkSync(blurredFilePath);
    }

    // Send success response
    res.json({
      success: true,
      message: `${isVideo ? "Video" : "Image"} uploaded and blurred successfully`,
      document,
      fileUrl: publicUrl
    });

  } catch (error) {

    console.log("SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Upload failed"
    });
  } finally {
    if (uploadedTempPath && fs.existsSync(uploadedTempPath)) {
      fs.unlinkSync(uploadedTempPath);
    }

  }
});

module.exports = router;
