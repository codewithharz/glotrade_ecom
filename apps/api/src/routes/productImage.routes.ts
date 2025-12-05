// src/routes/productImage.routes.ts
import { Router } from "express";
import multer from "multer";
import { ProductImageController } from "../controllers/productImage.controller";
import { auth } from "../middleware/auth";
import { UserService } from "../services/UserService";

const router = Router();
const userService = new UserService();
const productImageController = new ProductImageController();

// Configure multer for product image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 10, // Max 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Apply authentication middleware to all routes
router.use(auth(userService));

// Product image management routes
router.post(
  "/upload/:productId",
  upload.array('images', 10), // Allow up to 10 images
  productImageController.uploadProductImages
);

router.delete(
  "/delete",
  productImageController.deleteProductImage
);

router.delete(
  "/delete-all/:productId",
  productImageController.deleteAllProductImages
);

router.post(
  "/reorder",
  productImageController.reorderProductImages
);

router.post(
  "/upload-url",
  productImageController.getUploadUrl
);

router.get(
  "/info/:productId",
  productImageController.getProductImageInfo
);

export default router; 