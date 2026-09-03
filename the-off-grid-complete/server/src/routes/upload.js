import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

/*
  LOCAL FILE UPLOAD

  Admin can now upload a product image/video file instead of pasting a
  URL. Files are stored on this server's disk at server/uploads and
  served statically at /uploads/<filename>.

  IMPORTANT — Render's free/standard web service disk is EPHEMERAL:
  uploaded files are wiped on every redeploy or restart. This is fine
  for testing and for a low-traffic store where you re-upload rarely,
  but for a permanent production setup you should eventually point
  this at Cloudinary, S3, or Render's persistent disk add-on. Swapping
  the storage engine here later won't require any frontend changes —
  only this file.
*/

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const allowedTypes = /jpeg|jpg|png|webp|gif|mp4|webm|mov/;

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowedTypes.test(ext)) return cb(null, true);
    cb(new Error('Unsupported file type'));
  }
});

// POST /api/upload — admin only, single file field named "file"
router.post('/', auth, admin, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const base = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    res.status(201).json({
      url: `${base}/uploads/${req.file.filename}`,
      filename: req.file.filename
    });
  });
});

export default router;
