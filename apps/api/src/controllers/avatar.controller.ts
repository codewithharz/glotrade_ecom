// src/controllers/avatar.controller.ts
// Express types handled by any
import { AuthRequest } from "../middleware/auth";
import { ValidationError } from "../utils/errors";
import { R2Service } from "../services/R2Service";
import { UserService } from "../services/UserService";
import { User } from "../models";

export class AvatarController {
  private r2Service: R2Service;
  private userService: UserService;

  constructor() {
    this.r2Service = new R2Service();
    this.userService = new UserService();
  }

  /**
   * Upload avatar image
   */
  uploadAvatar = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new ValidationError("Authentication required");
      }

      if (!req.file) {
        throw new ValidationError("No file uploaded");
      }

      const { buffer, mimetype, originalname } = req.file;
      const userId = req.user.id;

      // Validate file
      this.r2Service.validateFile(buffer, mimetype);

      // Check if user already has an avatar and delete it first
      if (req.user.profileImage) {
        try {
          const oldPublicUrl = this.r2Service.getPublicUrl();
          const oldKey = req.user.profileImage.replace(oldPublicUrl + '/', '');
          console.log('Deleting old avatar with key:', oldKey);
          await this.r2Service.deleteFile(oldKey);
        } catch (deleteError) {
          console.error('Failed to delete old avatar:', deleteError);
          // Continue with upload even if deletion fails
        }
      }

      // Generate unique key for the avatar
      const key = this.r2Service.generateAvatarKey(userId, originalname);

      // Upload to R2
      const uploadResult = await this.r2Service.uploadFile(buffer, key, mimetype, {
        userId: userId,
        originalName: originalname,
        uploadedAt: new Date().toISOString(),
      });

      // Update user profile with new avatar URL
      const updatedUser = await this.userService.updateById(userId, {
        profileImage: uploadResult.url,
      });

      if (!updatedUser) {
        throw new ValidationError("Failed to update user profile");
      }

      res.json({
        status: "success",
        data: {
          avatar: {
            url: uploadResult.url,
            key: uploadResult.key,
            size: uploadResult.size,
            mimeType: uploadResult.mimeType,
          },
          user: {
            id: updatedUser._id,
            profileImage: updatedUser.profileImage,
          },
        },
        message: "Avatar uploaded successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete avatar image
   */
  deleteAvatar = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new ValidationError("Authentication required");
      }

      const userId = req.user.id;
      const user = await this.userService.findById(userId);

      if (!user.profileImage) {
        throw new ValidationError("No avatar to delete");
      }

      // Extract key from URL (assuming URL format: publicUrl/key)
      const urlParts = user.profileImage.split('/');
      // The key should be everything after the domain, including the avatars folder
      const publicUrl = this.r2Service.getPublicUrl();
      const key = user.profileImage.replace(publicUrl + '/', '');
      
      console.log('Deleting avatar with key:', key); // Debug log
      console.log('Full URL:', user.profileImage); // Debug log
      console.log('Public URL:', publicUrl); // Debug log

      // Delete from R2
      await this.r2Service.deleteFile(key);

      // Update user profile to remove avatar
      const updatedUser = await this.userService.updateById(userId, {
        profileImage: undefined,
      });

      if (!updatedUser) {
        throw new ValidationError("Failed to update user profile");
      }

      res.json({
        status: "success",
        data: {
          user: {
            id: updatedUser._id,
            profileImage: updatedUser.profileImage,
          },
        },
        message: "Avatar deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get presigned upload URL for direct uploads
   */
  getUploadUrl = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new ValidationError("Authentication required");
      }

      const { filename, mimeType } = req.body;
      
      if (!filename || !mimeType) {
        throw new ValidationError("filename and mimeType are required");
      }

      const userId = req.user.id;
      const key = this.r2Service.generateAvatarKey(userId, filename);

      // Generate presigned upload URL
      const uploadUrl = await this.r2Service.generatePresignedUploadUrl(key, mimeType);

      res.json({
        status: "success",
        data: {
          uploadUrl,
          key,
          expiresIn: 3600, // 1 hour
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get presigned URL for avatar display
   */
  getPresignedUrl = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new ValidationError("Authentication required");
      }

      const { avatarUrl } = req.body;
      
      if (!avatarUrl) {
        throw new ValidationError("avatarUrl is required");
      }

      // Extract key from URL
      const urlParts = avatarUrl.split('/');
      const key = urlParts.slice(-2).join('/'); // Get last two parts for avatars/userId/filename

      // Generate presigned access URL
      const presignedUrl = await this.r2Service.generatePresignedAccessUrl(key, 3600); // 1 hour

      res.json({
        status: "success",
        data: {
          presignedUrl,
          key,
          expiresIn: 3600,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get avatar information
   */
  getAvatarInfo = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new ValidationError("Authentication required");
      }

      const userId = req.user.id;
      const user = await this.userService.findById(userId);

      res.json({
        status: "success",
        data: {
          hasAvatar: !!user.profileImage,
          avatarUrl: user.profileImage || null,
          userId: user._id,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Clean up old avatar URLs in user profiles
   */
  cleanupOldAvatarUrls = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new ValidationError("Authentication required");
      }

      const userId = req.user.id;
      const user = await this.userService.findById(userId);

      if (!user.profileImage) {
        return res.json({
          status: "success",
          data: { message: "No avatar to clean up" },
        });
      }

      // Check if the URL is the old format and convert it
      if (user.profileImage.includes('11c59324aa996dcaa879444ac86cd84e.r2.cloudflarestorage.com')) {
        // Convert old URL to new format
        const oldUrl = user.profileImage;
        const newUrl = oldUrl.replace(
          'https://afritrade-avatars.11c59324aa996dcaa879444ac86cd84e.r2.cloudflarestorage.com',
          'https://pub-933ea5269afc4fa1ac618b3a1d0d7f16.r2.dev'
        );

        // Update user with new URL
        await this.userService.updateById(userId, {
          profileImage: newUrl,
        });

        return res.json({
          status: "success",
          data: { 
            message: "Old avatar URL converted to new format",
            oldUrl,
            newUrl,
            user: { profileImage: newUrl }
          },
        });
      }

      // Check if the URL is properly formatted
      if (!user.profileImage.startsWith('http')) {
        // Remove invalid avatar URL
        await this.userService.updateById(userId, {
          profileImage: undefined,
        });

        return res.json({
          status: "success",
          data: { 
            message: "Invalid avatar URL cleaned up",
            user: { profileImage: null }
          },
        });
      }

      res.json({
        status: "success",
        data: { 
          message: "Avatar URL is valid",
          user: { profileImage: user.profileImage }
        },
      });
    } catch (error) {
      next(error);
    }
  };
} 