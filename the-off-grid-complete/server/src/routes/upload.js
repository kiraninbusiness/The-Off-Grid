import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

/*
  FILE UPLOAD — Cloudinary when configured, local disk otherwise
  ------------------------------------------------------------------
  Set CLOUDINARY_URL (format: cloudinary://key:secret@cloud_name —
  copy it straight from your Cloudinary dashboard) and uploads go
  straight to Cloudinary: CDN-served, auto-optimized, and survives
  every deploy.

  Without it, files fall back to local disk at server/uploads, served
  at /uploads/<filename>. That still works end-to-end for testing, but
  Render's default disk is EPHEMERAL — uploaded files are wiped on
  every redeploy/restart. Fine short-term, not fine once you're
  relying on product images actually staying up. No frontend changes
  needed either way — this file decides where the file ends up and
  returns a URL; the rest of the app just uses that URL.
*/

const useCloudinary = Boolean(process.env.CLOUDINARY_URL);
if (useCloudinary) cloudinary.config(); // reads CLOUDINARY_URL automatically

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');
if (!useCloudinary && !fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = /jpeg|jpg|png|webp|gif|mp4|webm|mov/;
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowedTypes.test(ext)) return cb(null, true);
  cb(new Error('Unsupported file type'));
};

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage: useCloudinary ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter
});

function uploadBufferToCloudinary(buffer, isVideo) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'the-off-grid', resource_type: isVideo ? 'video' : 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// POST /api/upload — admin only, single file field named "file"
router.post('/', auth, admin, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    if (useCloudinary) {
      try {
        const isVideo = /mp4|webm|mov/.test(path.extname(req.file.originalname).toLowerCase());
        const result = await uploadBufferToCloudinary(req.file.buffer, isVideo);
        return res.status(201).json({ url: result.secure_url, filename: result.public_id, storage: 'cloudinary' });
      } catch (e) {
        console.error('CLOUDINARY UPLOAD ERROR:', e.message);
        return res.status(500).json({ message: 'Cloudinary upload failed' });
      }
    }

    const base = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    res.status(201).json({
      url: `${base}/uploads/${req.file.filename}`,
      filename: req.file.filename,
      storage: 'local'
    });
  });
});

export default router;
