import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

/* =====================================================
   MULTER CONFIG (DISK STORAGE)
===================================================== */

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB – PDFs with embedded images can be large
  },
});

/* =====================================================
   GET /api/uploads (Health Check)
===================================================== */

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Upload endpoint is ready",
  });
});

/* =====================================================
   POST /api/uploads
===================================================== */

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      console.log("[UPLOAD] File upload request received");
      console.log("[UPLOAD] File:", req.file
        ? { name: req.file.originalname, size: req.file.size, saved: req.file.filename }
        : "None"
      );

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Serve the file via the static /uploads route in Express
      const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      console.log("[UPLOAD] File saved locally at:", fileUrl);

      return res.status(200).json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
      });
    } catch (err) {
      console.error("[UPLOAD] Upload error:", err);
      return res.status(500).json({
        success: false,
        message: "Upload failed: " + (err instanceof Error ? err.message : String(err)),
      });
    }
  }
);

export default router;
