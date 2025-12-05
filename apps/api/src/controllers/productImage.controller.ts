// src/controllers/productImage.controller.ts
// Express types handled by any
import { AuthRequest } from "../middleware/auth";
import { ValidationError } from "../utils/errors";
import { R2Service } from "../services/R2Service";
import { UserService } from "../services/UserService";
import { Product } from "../models";

export class ProductImageController {
  private r2Service: R2Service;
  private userService: UserService;

  constructor() {
    this.r2Service = new R2Service();
    this.userService = new UserService();
  }

  /**
   * Upload product images
   */
  uploadProductImages = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      if (!req.files || !Array.isArray(req.files)) {
        throw new ValidationError("No images uploaded");
      }

      const { productId } = req.params;
      if (!productId) {
        throw new ValidationError("Product ID is required");
      }

      // Verify product exists and belongs to user
      const product = await Product.findById(productId);
      if (!product) {
        throw new ValidationError("Product not found");
      }

      if (product.seller.toString() !== req.user.id) {
        throw new ValidationError("Access denied: Product does not belong to you");
      }

      const uploadedImages: Array<{ url: string; key: string; size: number; mimeType: string }> = [];

      // Process each uploaded file
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as any;
        
        // Validate file
        this.r2Service.validateProductImage(file.buffer, file.mimetype);

        // Generate unique key
        const key = this.r2Service.generateProductImageKey(productId, file.originalname, i);

        // Upload to R2
        const uploadResult = await this.r2Service.uploadFile(file.buffer, key, file.mimetype, {
          productId: productId,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
          uploadedBy: req.user.id,
          index: i.toString(),
        });

        uploadedImages.push(uploadResult);
      }

      // Update product with new image URLs
      const newImageUrls = [...(product.images || []), ...uploadedImages.map(img => img.url)];
      await Product.findByIdAndUpdate(productId, { images: newImageUrls });

      res.json({
        status: "success",
        data: {
          images: uploadedImages,
          product: {
            id: productId,
            images: newImageUrls,
          },
        },
        message: `${uploadedImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a specific product image
   */
  deleteProductImage = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const { productId, imageUrl } = req.body;
      if (!productId || !imageUrl) {
        throw new ValidationError("Product ID and image URL are required");
      }

      // Verify product exists and belongs to user
      const product = await Product.findById(productId);
      if (!product) {
        throw new ValidationError("Product not found");
      }

      if (product.seller.toString() !== req.user.id) {
        throw new ValidationError("Access denied: Product does not belong to you");
      }

      // Extract key from image URL
      const publicUrl = this.r2Service.getPublicUrl();
      const key = imageUrl.replace(publicUrl + '/', '');

      // Delete from R2
      await this.r2Service.deleteFile(key);

      // Remove from product images array
      const updatedImages = product.images.filter(img => img !== imageUrl);
      await Product.findByIdAndUpdate(productId, { images: updatedImages });

      res.json({
        status: "success",
        data: {
          product: {
            id: productId,
            images: updatedImages,
          },
        },
        message: "Image deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete all images for a product
   */
  deleteAllProductImages = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const { productId } = req.params;
      if (!productId) {
        throw new ValidationError("Product ID is required");
      }

      // Verify product exists and belongs to user
      const product = await Product.findById(productId);
      if (!product) {
        throw new ValidationError("Product not found");
      }

      if (product.seller.toString() !== req.user.id) {
        throw new ValidationError("Access denied: Product does not belong to you");
      }

      // Delete all images from R2
      await this.r2Service.deleteProductImages(productId);

      // Clear product images array
      await Product.findByIdAndUpdate(productId, { images: [] });

      res.json({
        status: "success",
        data: {
          product: {
            id: productId,
            images: [],
          },
        },
        message: "All product images deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reorder product images
   */
  reorderProductImages = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const { productId, imageUrls } = req.body;
      if (!productId || !Array.isArray(imageUrls)) {
        throw new ValidationError("Product ID and image URLs array are required");
      }

      // Verify product exists and belongs to user
      const product = await Product.findById(productId);
      if (!product) {
        throw new ValidationError("Product not found");
      }

      if (product.seller.toString() !== req.user.id) {
        throw new ValidationError("Access denied: Product does not belong to you");
      }

      // Verify all URLs belong to this product
      const productImageUrls = new Set(product.images);
      const allUrlsValid = imageUrls.every(url => productImageUrls.has(url));
      if (!allUrlsValid) {
        throw new ValidationError("Some image URLs do not belong to this product");
      }

      // Update product with new image order
      await Product.findByIdAndUpdate(productId, { images: imageUrls });

      res.json({
        status: "success",
        data: {
          product: {
            id: productId,
            images: imageUrls,
          },
        },
        message: "Image order updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get presigned upload URL for direct client upload
   */
  getUploadUrl = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const { productId, filename, mimeType, index = 0 } = req.body;
      if (!productId || !filename || !mimeType) {
        throw new ValidationError("Product ID, filename, and MIME type are required");
      }

      // Verify product exists and belongs to user
      const product = await Product.findById(productId);
      if (!product) {
        throw new ValidationError("Product not found");
      }

      if (product.seller.toString() !== req.user.id) {
        throw new ValidationError("Access denied: Product does not belong to you");
      }

      // Generate key and presigned URL
      const key = this.r2Service.generateProductImageKey(productId, filename, index);
      const uploadUrl = await this.r2Service.generatePresignedUploadUrl(key, mimeType);

      res.json({
        status: "success",
        data: {
          uploadUrl,
          key,
          expiresIn: 3600,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get product image information
   */
  getProductImageInfo = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const { productId } = req.params;
      if (!productId) {
        throw new ValidationError("Product ID is required");
      }

      // Verify product exists and belongs to user
      const product = await Product.findById(productId);
      if (!product) {
        throw new ValidationError("Product not found");
      }

      if (product.seller.toString() !== req.user.id) {
        throw new ValidationError("Access denied: Product does not belong to you");
      }

      // Get image URLs from R2 (in case there are orphaned files)
      const r2ImageUrls = await this.r2Service.getProductImageUrls(productId);
      
      res.json({
        status: "success",
        data: {
          product: {
            id: productId,
            images: product.images,
            totalImages: product.images.length,
          },
          r2Images: r2ImageUrls,
          r2TotalImages: r2ImageUrls.length,
        },
      });
    } catch (error) {
      next(error);
    }
  };
} 