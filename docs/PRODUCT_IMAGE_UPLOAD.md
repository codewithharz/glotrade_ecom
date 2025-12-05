# Product Image Upload System

## Overview

The AfriTrade Hub platform now includes a comprehensive product image upload system using Cloudflare R2 storage. This system allows vendors to upload, manage, and organize product images with a modern drag-and-drop interface.

## Features

### ✅ **Core Functionality**
- **Drag & Drop Upload**: Intuitive drag-and-drop interface for multiple images
- **Multiple Image Support**: Upload up to 10 images per product
- **Automatic Organization**: Images are automatically organized by product ID
- **Real-time Preview**: See uploaded images immediately
- **Image Management**: Delete, reorder, and manage individual images

### ✅ **Technical Features**
- **R2 Cloud Storage**: Images stored in Cloudflare R2 with CDN delivery
- **File Validation**: Automatic file type and size validation
- **Progress Tracking**: Real-time upload progress indicators
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Works seamlessly on desktop and mobile

### ✅ **User Experience**
- **Two-Step Process**: Create product first, then add images
- **Visual Feedback**: Clear status indicators for all operations
- **Intuitive Controls**: Easy-to-use image management tools
- **Helpful Guidance**: Clear instructions and best practices

## Architecture

### **Backend Components**

1. **R2Service Extension** (`apps/api/src/services/R2Service.ts`)
   - `generateProductImageKey()` - Generate unique keys for product images
   - `deleteProductImages()` - Bulk delete all images for a product
   - `getProductImageUrls()` - Retrieve all image URLs for a product
   - `validateProductImage()` - Validate file type and size

2. **ProductImageController** (`apps/api/src/controllers/productImage.controller.ts`)
   - `uploadProductImages()` - Handle multiple image uploads
   - `deleteProductImage()` - Delete individual images
   - `deleteAllProductImages()` - Bulk delete all product images
   - `reorderProductImages()` - Change image order
   - `getUploadUrl()` - Generate presigned upload URLs
   - `getProductImageInfo()` - Get product image information

3. **Product Image Routes** (`apps/api/src/routes/productImage.routes.ts`)
   - `POST /api/v1/product-images/upload/:productId` - Upload images
   - `DELETE /api/v1/product-images/delete` - Delete single image
   - `DELETE /api/v1/product-images/delete-all/:productId` - Delete all images
   - `POST /api/v1/product-images/reorder` - Reorder images
   - `POST /api/v1/product-images/upload-url` - Get presigned URL
   - `GET /api/v1/product-images/info/:productId` - Get image info

### **Frontend Components**

1. **ProductImageUpload** (`apps/web/src/components/product/ProductImageUpload.tsx`)
   - Drag & drop interface
   - File validation and progress tracking
   - Image preview and management
   - Reordering capabilities

2. **Enhanced Add Product Form** (`apps/web/src/app/vendor/products/new/page.tsx`)
   - Two-step workflow (details → images)
   - Integration with ProductImageUpload component
   - Seamless user experience

## API Endpoints

### **Upload Product Images**
```http
POST /api/v1/product-images/upload/:productId
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: images (files)
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "images": [
      {
        "url": "https://pub-*.r2.dev/products/productId/timestamp_0.jpg",
        "key": "products/productId/timestamp_0.jpg",
        "size": 1024000,
        "mimeType": "image/jpeg"
      }
    ],
    "product": {
      "id": "productId",
      "images": ["https://pub-*.r2.dev/products/productId/timestamp_0.jpg"]
    }
  },
  "message": "1 image(s) uploaded successfully"
}
```

### **Delete Product Image**
```http
DELETE /api/v1/product-images/delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "productId",
  "imageUrl": "https://pub-*.r2.dev/products/productId/timestamp_0.jpg"
}
```

### **Reorder Product Images**
```http
POST /api/v1/product-images/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "productId",
  "imageUrls": [
    "https://pub-*.r2.dev/products/productId/timestamp_1.jpg",
    "https://pub-*.r2.dev/products/productId/timestamp_0.jpg"
  ]
}
```

## File Organization

### **Storage Structure**
```
products/
├── productId1/
│   ├── timestamp_0.jpg
│   ├── timestamp_1.png
│   └── timestamp_2.webp
├── productId2/
│   ├── timestamp_0.gif
│   └── timestamp_1.jpg
└── productId3/
    └── timestamp_0.png
```

### **Naming Convention**
- **Format**: `products/{productId}/{timestamp}_{index}.{extension}`
- **Timestamp**: Unix timestamp for uniqueness
- **Index**: Sequential number for ordering
- **Extension**: Original file extension preserved

## User Workflow

### **Step 1: Create Product**
1. User fills out product details form
2. Clicks "Create Product & Add Images"
3. Product is created with empty images array
4. User is redirected to image upload step

### **Step 2: Upload Images**
1. User sees ProductImageUpload component
2. Can drag & drop images or click to browse
3. Images are uploaded to R2 and associated with product
4. User can reorder, delete, or add more images
5. Clicks "Complete Product" when satisfied

### **Step 3: Product Completion**
1. Product is updated with final image URLs
2. User is redirected to vendor dashboard
3. Product is now live with images

## Configuration

### **Environment Variables**
```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name
R2_PUBLIC_URL=https://your-public-domain.com
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### **File Limits**
- **Maximum Images**: 10 per product
- **File Size**: 10MB per image
- **File Types**: JPEG, PNG, WebP, GIF
- **Storage**: Cloudflare R2 with CDN

## Security Features

### **Authentication & Authorization**
- All endpoints require valid JWT token
- Users can only manage their own product images
- Product ownership verification on all operations

### **File Validation**
- File type validation (images only)
- File size limits (10MB max)
- Malicious file detection
- Secure file handling

### **Access Control**
- Private R2 bucket with public read access
- Presigned URLs for secure uploads
- User isolation (can't access other users' images)

## Error Handling

### **Common Errors**

1. **File Too Large**:
   ```json
   {
     "status": "error",
     "message": "File size exceeds maximum limit of 10MB"
   }
   ```

2. **Invalid File Type**:
   ```json
   {
     "status": "error",
     "message": "File type application/pdf is not allowed. Allowed types: image/jpeg, image/png, image/webp, image/gif"
   }
   ```

3. **Product Not Found**:
   ```json
   {
     "status": "error",
     "message": "Product not found"
   }
   ```

4. **Access Denied**:
   ```json
   {
     "status": "error",
     "message": "Access denied: Product does not belong to you"
   }
   ```

### **Frontend Error Handling**
- Toast notifications for all errors
- Progress indicators for uploads
- Graceful fallbacks for failed operations
- User-friendly error messages

## Performance Optimization

### **Upload Optimization**
- Parallel uploads for multiple images
- Progress tracking for user feedback
- Efficient file handling with multer
- Memory-based processing

### **Storage Optimization**
- Automatic file organization by product
- Efficient key generation
- CDN delivery for fast loading
- Automatic cleanup capabilities

### **User Experience**
- Immediate visual feedback
- Responsive drag & drop
- Smooth animations and transitions
- Mobile-friendly interface

## Monitoring & Maintenance

### **Health Checks**
- Monitor upload success rates
- Track storage usage
- Monitor CDN performance
- Error rate monitoring

### **Cleanup Procedures**
- Orphaned file detection
- Bulk deletion capabilities
- Storage usage optimization
- Regular maintenance tasks

## Future Enhancements

### **Planned Features**
- **Image Optimization**: Automatic resizing and compression
- **Multiple Formats**: Generate WebP/AVIF versions
- **Image Cropping**: Client-side image editing
- **Bulk Operations**: Multiple product image management
- **Analytics**: Upload and usage statistics

### **Advanced Features**
- **AI Tagging**: Automatic image tagging
- **Duplicate Detection**: Prevent duplicate uploads
- **Batch Processing**: Bulk image operations
- **Advanced Filters**: Image search and filtering

## Troubleshooting

### **Common Issues**

1. **Upload Fails**:
   - Check R2 credentials and permissions
   - Verify bucket exists and is public
   - Check file size and type limits

2. **Images Not Displaying**:
   - Verify R2_PUBLIC_URL configuration
   - Check bucket public access settings
   - Verify custom domain configuration

3. **Delete Not Working**:
   - Check R2 bucket permissions
   - Verify key extraction in logs
   - Ensure proper authentication

4. **Reorder Fails**:
   - Verify all URLs belong to product
   - Check product ownership
   - Ensure proper authentication

### **Debug Information**
- Comprehensive logging in backend
- Frontend console logging
- Network request monitoring
- Error tracking and reporting

## Best Practices

### **For Developers**
- Always validate file types and sizes
- Implement proper error handling
- Use appropriate HTTP status codes
- Follow security best practices

### **For Users**
- Use high-quality images (800x800 minimum)
- Optimize file sizes before upload
- Use descriptive image names
- Maintain consistent aspect ratios

### **For Administrators**
- Monitor storage usage regularly
- Set appropriate file size limits
- Configure CDN settings properly
- Implement backup strategies

---

**Note**: This system provides a robust, production-ready product image management solution with excellent user experience and comprehensive error handling. Always test thoroughly before deploying to production. 