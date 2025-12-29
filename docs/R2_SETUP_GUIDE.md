# R2 Setup Guide - Step by Step

## 🎯 **Step 1: Create R2 Bucket**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/11c59324aa996dcaa879444ac86cd84e/r2/overview)
2. Click **"Create bucket"**
3. Enter bucket name: `glotrade-assets`
4. Set **Public bucket** to **ON**
5. Click **"Create bucket"**

## 🔑 **Step 2: Generate API Token**

1. Go to [My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Choose **"Custom token"**
4. Set permissions:
   - **Account** → **R2 Object Storage** → **Edit**
   - **Zone** → **Zone** → **Edit** (if you have a custom domain)
5. Click **"Continue to summary"**
6. Click **"Create Token"**
7. **Copy the token details** (you won't see them again!)

## 📝 **Step 3: Create Environment File**

Create `apps/api/.env` with:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=11c59324aa996dcaa879444ac86cd84e
R2_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_HERE
R2_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE
R2_BUCKET_NAME=glotrade-assets
R2_PUBLIC_URL=https://your-public-url.r2.dev
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/glotrade_ecom
PORT=8080

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
```

## 🌐 **Step 4: Test the Setup**

1. Restart your API server
2. Test avatar upload endpoint
3. Check R2 bucket for uploaded files

## ✅ **Step 5: Verify Configuration**

After setup, verify these URLs work:

- **Your R2 bucket**: `https://dash.cloudflare.com/11c59324aa996dcaa879444ac86cd84e/r2/overview`
- **Public URL**: `https://pub-933ea5269afc4fa1ac618b3a1d0d7f16.r2.dev`
- **API Endpoint**: `https://11c59324aa996dcaa879444ac86cd84e.r2.cloudflarestorage.com`

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: 404 Errors on Avatar Load**
**Symptoms**: Browser shows 404 errors for avatar images
**Solution**: 
1. Ensure `R2_PUBLIC_URL` is set correctly
2. Use the cleanup endpoint: `POST /api/v1/avatars/cleanup`
3. Check if files exist in your R2 bucket

### **Issue 2: Upload Fails**
**Symptoms**: Avatar upload returns error
**Solution**:
1. Verify R2 credentials in `.env`
2. Check bucket permissions
3. Ensure bucket is public

### **Issue 3: Old URLs Still Working**
**Symptoms**: Old avatar URLs still accessible
**Solution**:
1. Call cleanup endpoint to convert old URLs
2. Restart API server after `.env` changes
3. Clear browser cache

### **Issue 4: Delete Not Working**
**Symptoms**: Avatar delete fails or image returns after refresh
**Solution**:
1. Check R2 bucket permissions
2. Verify key extraction in logs
3. Ensure proper authentication

## 🚀 **Advanced Configuration**

### **Custom Domain Setup**
1. In your R2 bucket settings, click **"Settings"**
2. Under **"Custom Domains"**, click **"Add custom domain"**
3. Enter your domain (e.g., `avatars.yourdomain.com`)
4. Follow DNS setup instructions
5. Update `R2_PUBLIC_URL` in your `.env`

### **Production Considerations**
- **Rate Limiting**: R2 public URLs are rate-limited
- **Custom Domain**: Recommended for production use
- **Monitoring**: Track storage usage and costs
- **Backup**: Consider backup strategies for important avatars

## 📊 **Monitoring Your Setup**

### **Check R2 Dashboard**
- **Bucket Size**: Monitor storage usage
- **Operations**: Track upload/delete counts
- **Performance**: Monitor CDN delivery

### **API Health Checks**
- **Upload Success Rate**: Monitor upload endpoints
- **Delete Success Rate**: Monitor delete operations
- **Error Logs**: Check for authentication or permission issues

## ❓ **Need Help?**

- **Account ID**: Already correct (11c59324aa996dcaa879444ac86cd84e)
- **Bucket Name**: Use `glotrade-assets`
- **Public URL**: Use the R2 endpoint for now
- **Support**: Check Cloudflare R2 documentation for advanced features

## 🎉 **Success Indicators**

Your R2 setup is working correctly when:
- ✅ Avatar uploads complete successfully (200 status)
- ✅ Images display without 404 errors
- ✅ Avatar deletion removes files from R2
- ✅ No orphaned files accumulate in bucket
- ✅ Automatic cleanup works on new uploads

## 🔄 **Maintenance**

### **Regular Tasks**
- Monitor storage usage monthly
- Check for orphaned files quarterly
- Update R2 credentials annually
- Review access permissions

### **Updates**
- Keep Cloudflare R2 SDK updated
- Monitor for new R2 features
- Update documentation as needed

---

**Note**: This setup provides a robust, production-ready avatar system with automatic cleanup and error handling. Test thoroughly before deploying to production. 