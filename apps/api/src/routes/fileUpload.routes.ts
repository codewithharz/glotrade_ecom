import { Router } from "express";
import multer from "multer";
import { FileUploadController } from "../controllers/fileUpload.controller";
import { auth } from "../middleware/auth";
import { UserService } from "../services/UserService";

const router = Router();
const userService = new UserService();
const fileUploadController = new FileUploadController();

// Configure multer for memory storage (we'll upload directly to R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  },
});

// All routes require authentication
router.use(auth(userService));

// Generic file upload (doesn't update user profile)
router.post("/upload", upload.single('file') as any, fileUploadController.uploadFile);

export default router;