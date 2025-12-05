// src/services/R2Service.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ValidationError } from '../utils/errors';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
  endpoint: string;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export class R2Service {
  private client: S3Client;
  private config: R2Config;

  constructor() {
    this.config = {
      accountId: process.env.R2_ACCOUNT_ID || '',
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      bucketName: process.env.R2_BUCKET_NAME || '',
      publicUrl: process.env.R2_PUBLIC_URL || '',
      endpoint: process.env.R2_ENDPOINT || '',
    };

    // Validate configuration
    if (!this.config.accountId || !this.config.accessKeyId || !this.config.secretAccessKey || !this.config.bucketName) {
      throw new Error('R2 configuration incomplete. Please check environment variables.');
    }

    // Ensure we have the correct public URL
    if (!this.config.publicUrl) {
      throw new Error('R2_PUBLIC_URL is required for public access');
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  /**
   * Upload a file to R2
   */
  async uploadFile(
    file: Buffer,
    key: string,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        Body: file,
        ContentType: mimeType,
        Metadata: metadata,
        ACL: 'public-read',
      });

      await this.client.send(command);

      const url = `${this.config.publicUrl}/${key}`;

      return {
        url,
        key,
        size: file.length,
        mimeType,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new ValidationError('Failed to upload file to R2');
    }
  }

  /**
   * Delete a file from R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('R2 delete error:', error);
      throw new ValidationError('Failed to delete file from R2');
    }
  }

  /**
   * Generate a presigned URL for direct uploads
   */
  async generatePresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        ContentType: mimeType,
        ACL: 'public-read',
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('R2 presigned URL error:', error);
      throw new ValidationError('Failed to generate presigned upload URL');
    }
  }

  /**
   * Generate a presigned URL for file access
   */
  async generatePresignedAccessUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      // Instead of generating a presigned URL, return the public URL directly
      // This eliminates the 404 errors completely
      // Ensure the key includes the full path (e.g., avatars/userId/filename)
      const fullKey = key.startsWith('avatars/') ? key : `avatars/${key}`;
      return `${this.config.publicUrl}/${fullKey}`;
    } catch (error) {
      console.error('R2 presigned access URL error:', error);
      throw new ValidationError('Failed to generate presigned access URL');
    }
  }

  /**
   * Get the public URL configuration
   */
  getPublicUrl(): string {
    return this.config.publicUrl;
  }

  /**
   * Generate a unique key for avatar uploads
   */
  generateAvatarKey(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'jpg';
    // Ensure the path includes the avatars folder
    return `avatars/${userId}/${timestamp}.${extension}`;
  }

  /**
   * Validate file type and size
   */
  validateFile(file: Buffer, mimeType: string): void {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
    const allowedTypes = process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (file.length > maxSize) {
      throw new ValidationError(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(mimeType)) {
      throw new ValidationError(`File type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Generate a key for product images
   */
  generateProductImageKey(productId: string, originalName: string, index: number = 0): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'jpg';
    return `products/${productId}/${timestamp}_${index}.${extension}`;
  }

  /**
   * Generate a key for product images with custom naming
   */
  generateProductImageKeyCustom(productId: string, originalName: string, customName?: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'jpg';
    const name = customName || originalName.split('.')[0];
    return `products/${productId}/${timestamp}_${name}.${extension}`;
  }

  /**
   * Delete multiple product images
   */
  async deleteProductImages(productId: string): Promise<void> {
    try {
      // List all objects with the product prefix
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      const listCommand = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: `products/${productId}/`,
      });

      const listResult = await this.client.send(listCommand);
      
      if (listResult.Contents && listResult.Contents.length > 0) {
        // Delete all objects in the product folder
        const deletePromises = listResult.Contents.map(obj => 
          this.deleteFile(obj.Key!)
        );
        
        await Promise.all(deletePromises);
        console.log(`Deleted ${listResult.Contents.length} images for product ${productId}`);
      }
    } catch (error) {
      console.error('Failed to delete product images:', error);
      throw new ValidationError('Failed to delete product images');
    }
  }

  /**
   * Get product image URLs for a product
   */
  async getProductImageUrls(productId: string): Promise<string[]> {
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      const listCommand = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: `products/${productId}/`,
      });

      const listResult = await this.client.send(listCommand);
      
      if (listResult.Contents && listResult.Contents.length > 0) {
        return listResult.Contents
          .map(obj => `${this.config.publicUrl}/${obj.Key}`)
          .sort(); // Sort for consistent ordering
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get product image URLs:', error);
      return [];
    }
  }

  /**
   * Validate product image file
   */
  validateProductImage(file: Buffer, mimeType: string): void {
    // Check file size (max 10MB for product images)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.length > maxSize) {
      throw new ValidationError(`File size exceeds maximum limit of 10MB`);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(mimeType)) {
      throw new ValidationError(`File type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Generate a key for business documents
   */
  generateBusinessDocumentKey(vendorId: string, documentType: string, filename: string): string {
    const timestamp = Date.now();
    const extension = filename.split('.').pop() || 'pdf';
    const sanitizedType = documentType.replace(/[^a-zA-Z0-9]/g, '_');
    return `business-documents/${vendorId}/${sanitizedType}/${timestamp}.${extension}`;
  }

  /**
   * Validate business document file
   */
  validateBusinessDocument(file: any): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { isValid: false, error: 'Only PDF, JPEG, and PNG files are allowed' };
    }
    
    return { isValid: true };
  }

  /**
   * Delete business documents for a vendor
   */
  async deleteBusinessDocuments(vendorId: string): Promise<void> {
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      const listCommand = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: `business-documents/${vendorId}/`,
      });

      const listResult = await this.client.send(listCommand);
      
      if (listResult.Contents && listResult.Contents.length > 0) {
        // Delete all objects in the vendor's business documents folder
        const deletePromises = listResult.Contents.map(obj => 
          this.deleteFile(obj.Key!)
        );
        
        await Promise.all(deletePromises);
        console.log(`Deleted ${listResult.Contents.length} business documents for vendor ${vendorId}`);
      }
    } catch (error) {
      console.error('Failed to delete business documents:', error);
      throw new ValidationError('Failed to delete business documents');
    }
  }
} 