// src/routes/avatar.routes.ts
import { Router } from "express";
import multer from "multer";
import { AvatarController } from "../controllers/avatar.controller";
import { auth } from "../middleware/auth";
import { UserService } from "../services/UserService";

const router = Router();
const userService = new UserService();
const avatarController = new AvatarController();

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

// Upload avatar
router.post("/upload", upload.single('avatar'), avatarController.uploadAvatar);

// Delete avatar
router.delete("/delete", avatarController.deleteAvatar);

// Get avatar upload URL (for direct uploads)
router.post("/upload-url", avatarController.getUploadUrl);

// Get presigned URL for avatar display
router.post("/presigned-url", avatarController.getPresignedUrl);

// Get avatar info
router.get("/info", avatarController.getAvatarInfo);

// Clean up old avatar URLs
router.post("/cleanup", avatarController.cleanupOldAvatarUrls);

export default router; 