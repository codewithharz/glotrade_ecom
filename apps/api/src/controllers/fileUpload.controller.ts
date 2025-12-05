// Express types handled by any
import multer from "multer";
import { R2Service } from "../services/R2Service";
import { ValidationError } from "../utils/errors";
import { AuthRequest } from "../middleware/auth";

export class FileUploadController {
  private r2Service: R2Service;

  constructor() {
    this.r2Service = new R2Service();
  }

  // Generic file upload that doesn't update user profile
  uploadFile = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new ValidationError("Authentication required");
      }

      if (!req.file) {
        throw new ValidationError("No file uploaded");
      }

      const { buffer, originalname, mimetype } = req.file;
      const userId = req.user.id;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(mimetype)) {
        throw new ValidationError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxSize) {
        throw new ValidationError("File size must be less than 5MB");
      }

      // Generate unique key for the file
      const timestamp = Date.now();
      const key = `uploads/${userId}/${timestamp}-${originalname}`;

      // Upload to R2
      const uploadResult = await this.r2Service.uploadFile(buffer, key, mimetype, {
        userId: userId,
        originalName: originalname,
        uploadedAt: new Date().toISOString(),
        purpose: 'generic-upload'
      });

      res.json({
        status: "success",
        data: {
          file: {
            url: uploadResult.url,
            key: uploadResult.key,
            size: uploadResult.size,
            mimeType: uploadResult.mimeType,
            originalName: originalname,
          },
        },
        message: "File uploaded successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}