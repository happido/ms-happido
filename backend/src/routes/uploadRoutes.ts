import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit to support videos
  }
});

// Route: POST /api/upload
// Expects a form-data field named 'file'
router.post('/', protect, upload.single('file'), uploadImage);

export default router;
