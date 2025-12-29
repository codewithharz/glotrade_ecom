# R2 Cloudflare Avatar Upload System

## Overview

The Glotrade International platform now includes a robust avatar upload system using Cloudflare R2 storage. This allows users to upload, manage, and display their profile pictures with high performance and reliability.

## Features

### ✅ **Core Functionality**
- **Direct File Upload**: Upload avatar images directly to R2
- **Automatic Cleanup**: Old avatars are automatically deleted when uploading new ones
- **File Validation**: Automatic file type and size validation
- **Public Access**: Avatars are publicly accessible via CDN
- **No 404 Errors**: Proper URL handling eliminates browser errors

### ✅ **Security Features**
- **Authentication Required**: All avatar operations require user authentication
- **File Type Validation**: Only allow safe image formats (JPEG, PNG, WebP, GIF)
- **Size Limits**: Configurable maximum file size (default: 5MB)
- **User Isolation**: Users can only manage their own avatars

### ✅ **Performance Features**
- **CDN Delivery**: Avatars served via Cloudflare's global CDN
- **Optimized Storage**: Efficient file organization and naming
- **Caching**: Automatic browser and CDN caching
- **Storage Efficiency**: Only one avatar per user (automatic cleanup)

## Configuration

### Environment Variables

Create a `.env` file in your `apps/api` directory:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name
R2_PUBLIC_URL=https://your-public-domain.com
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
```

### R2 Setup Steps

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard → R2 Object Storage
   - Create a new bucket (e.g., `glotrade-assets`)
   - Set bucket to public

2. **Generate API Tokens**:
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create custom token with R2 permissions
   - Copy Account ID, Access Key ID, and Secret Access Key

3. **Configure Custom Domain** (Optional):
   - Add custom domain to your R2 bucket
   - Update `R2_PUBLIC_URL` with your custom domain

## API Endpoints

### 1. Upload Avatar
```http
POST /api/v1/avatars/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: avatar (file)
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "avatar": {
      "url": "https://your-domain.com/avatars/userId/timestamp.jpg",
      "key": "avatars/userId/timestamp.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg"
    },
    "user": {
      "id": "userId",
      "profileImage": "https://your-domain.com/avatars/userId/timestamp.jpg"
    }
  },
  "message": "Avatar uploaded successfully"
}
```

**Note**: Automatically deletes old avatar before uploading new one.

### 2. Delete Avatar
```http
DELETE /api/v1/avatars/delete
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "userId",
      "profileImage": null
    }
  },
  "message": "Avatar deleted successfully"
}
```

### 3. Get Upload URL (Presigned)
```http
POST /api/v1/avatars/upload-url
Authorization: Bearer <token>
Content-Type: application/json

{
  "filename": "avatar.jpg",
  "mimeType": "image/jpeg"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "uploadUrl": "https://presigned-upload-url...",
    "key": "avatars/userId/timestamp.jpg",
    "expiresIn": 3600
  }
}
```

### 4. Get Avatar Info
```http
GET /api/v1/avatars/info
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "hasAvatar": true,
    "avatarUrl": "https://your-domain.com/avatars/userId/timestamp.jpg",
    "userId": "userId"
  }
}
```

### 5. Cleanup Old Avatar URLs
```http
POST /api/v1/avatars/cleanup
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Old avatar URL converted to new format",
    "oldUrl": "https://old-endpoint.com/...",
    "newUrl": "https://new-endpoint.com/...",
    "user": { "profileImage": "https://new-endpoint.com/..." }
  }
}
```

## Frontend Integration

### Direct Upload Example

```typescript
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('/api/v1/avatars/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();
  return result.data.avatar.url;
};
```

### Presigned URL Upload Example

```typescript
const uploadWithPresignedUrl = async (file: File) => {
  // 1. Get presigned URL
  const urlResponse = await fetch('/api/v1/avatars/upload-url', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
    }),
  });

  const { uploadUrl, key } = await urlResponse.json();

  // 2. Upload directly to R2
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  // 3. Update user profile
  const avatarUrl = `${process.env.NEXT_PUBLIC_R2_URL}/${key}`;
  await updateUserProfile({ profileImage: avatarUrl });
};
```

## File Organization

### Storage Structure
```
glotrade/
├── avatars/
│   ├── userId1/
│   │   ├── 1703123456789.jpg
│   │   └── 1703123567890.png
│   ├── userId2/
│   │   └── 1703123678901.webp
│   └── userId3/
│       └── 1703123789012.gif
```

### Naming Convention
- **Format**: `glotrade/avatars/{userId}/{timestamp}.{extension}`
- **Timestamp**: Unix timestamp for uniqueness
- **Extension**: Original file extension preserved

### Automatic Cleanup
- **One Avatar Per User**: Old avatars are automatically deleted
- **Storage Efficiency**: No orphaned files accumulate
- **Cost Optimization**: Minimal R2 storage usage

## Error Handling

### Common Errors

1. **File Too Large**:
   ```json
   {
     "status": "error",
     "message": "File size exceeds maximum limit of 5MB"
   }
   ```

2. **Invalid File Type**:
   ```json
   {
     "status": "error",
     "message": "File type image/bmp is not allowed. Allowed types: image/jpeg, image/png, image/webp, image/gif"
   }
   ```

3. **Authentication Required**:
   ```json
   {
     "status": "error",
     "message": "Authentication required"
   }
   ```

## Security Considerations

### ✅ **Implemented Security**
- File type validation
- File size limits
- User authentication required
- User isolation (can only manage own avatar)
- Automatic cleanup of old files

### 🔒 **Additional Recommendations**
- Implement rate limiting for uploads
- Add virus scanning for uploaded files
- Consider image optimization/compression
- Monitor storage usage and costs

## Performance Optimization

### CDN Benefits
- **Global Distribution**: Avatars served from nearest edge location
- **Automatic Caching**: Browser and CDN caching
- **Compression**: Automatic image optimization
- **HTTPS**: Secure delivery by default

### Storage Optimization
- **Efficient Naming**: Timestamp-based uniqueness
- **User Isolation**: Separate folders per user
- **Automatic Cleanup**: No orphaned files
- **Metadata**: Store upload information for tracking

## Monitoring and Maintenance

### Health Checks
- Monitor R2 bucket access
- Track upload success/failure rates
- Monitor storage usage and costs
- Check CDN performance metrics

### Cleanup Procedures
- Automatic cleanup on new uploads
- Monitor for orphaned files
- Regular storage usage reports

## Troubleshooting

### Common Issues

1. **Upload Fails**:
   - Check R2 credentials and permissions
   - Verify bucket exists and is public
   - Check file size and type limits

2. **Images Not Displaying**:
   - Verify R2_PUBLIC_URL configuration
   - Check bucket public access settings
   - Verify custom domain configuration

3. **Authentication Errors**:
   - Check JWT token validity
   - Verify user authentication middleware
   - Check user permissions

4. **404 Errors**:
   - Use the cleanup endpoint to fix old URLs
   - Ensure R2_PUBLIC_URL is correctly set
   - Check if files exist in the bucket

## Future Enhancements

### Planned Features
- **Image Optimization**: Automatic resizing and compression
- **Multiple Formats**: Generate WebP/AVIF versions
- **Avatar Cropping**: Client-side image editing
- **Bulk Operations**: Multiple avatar management
- **Analytics**: Upload and usage statistics

*This system is maintained by the Glotrade International development team.*

**Note**: This system provides a robust foundation for user avatar management with automatic cleanup and error-free operation. Always test thoroughly in development before deploying to production.