# Document Deduplication Implementation

## Overview

This document describes the implementation of **Option 1: Smart Upload with replacement** to prevent duplicate business documents in the AfriTrade platform.

## Problem Statement

Previously, when users uploaded business documents:
1. **Uploaded all 3 documents**
2. **Abandoned the form** without submitting
3. **Returned later** and uploaded again
4. **Submitted the form**

This resulted in:
- ❌ **Duplicate files** in R2 object storage
- ❌ **Duplicate database records** 
- ❌ **Increased storage costs**
- ❌ **Data inconsistency**

## Solution: Smart Upload with Replacement

### How It Works

1. **Check for Existing Documents**: Before uploading, the system checks if a document of the same type already exists
2. **Replace Instead of Create**: If a document exists, it's updated rather than creating a new one
3. **Clean Up Old Files**: Old R2 files are automatically deleted when replaced
4. **Track Replacement History**: Metadata includes when and what was replaced

### Implementation Details

#### Backend Changes

##### 1. Enhanced BusinessDocument Controller (`apps/api/src/controllers/businessDocument.controller.ts`)

- **Smart Document Detection**: Automatically detects existing documents of the same type
- **File Replacement Logic**: Updates existing documents instead of creating duplicates
- **R2 Cleanup**: Automatically deletes old files from R2 storage
- **Metadata Tracking**: Records replacement history and timestamps

```typescript
// Check for existing document of the same type
let document = await BusinessDocument.findOne({ 
  vendorId, 
  documentType 
});

if (document) {
  // Store old file URL for cleanup
  oldFileUrl = document.fileUrl;
  
  // Update existing document
  document.fileName = uploadResult.url.split('/').pop() || req.file.originalname;
  document.fileUrl = uploadResult.url;
  // ... other updates
  
  // Add replacement metadata
  document.metadata = {
    ...document.metadata,
    replacedAt: new Date(),
    previousFileUrl: oldFileUrl
  };
} else {
  // Create new document
  document = await BusinessDocument.create({...});
}

// Clean up old file from R2
if (oldFileUrl) {
  const oldKey = oldFileUrl.split('/').slice(-3).join('/');
  await this.r2Service.deleteFile(oldKey);
}
```

##### 2. Enhanced BusinessDocument Model (`apps/api/src/models/BusinessDocument.ts`)

- **Flexible Metadata**: Added support for replacement tracking fields
- **Type Safety**: Enhanced TypeScript interface for better type checking

```typescript
metadata?: {
  originalName: string;
  uploadDate: Date;
  fileHash?: string;
  country?: string;
  expiryDate?: Date;
  replacedAt?: Date;           // NEW: When document was replaced
  previousFileUrl?: string;     // NEW: URL of previous file
  [key: string]: any;          // NEW: Allow additional properties
};
```

##### 3. Admin Cleanup Endpoint (`POST /api/v1/business-documents/cleanup`)

- **Automatic Cleanup**: Removes abandoned temporary records older than 7 days
- **R2 File Cleanup**: Deletes orphaned files from object storage
- **Database Cleanup**: Removes abandoned Seller and BusinessDocument records

```typescript
cleanupAbandonedRecords = async (req: AuthRequest, res: Response) => {
  // Find temporary Seller records older than 7 days
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const abandonedSellers = await Seller.find({
    status: 'draft',
    createdAt: { $lt: cutoffDate }
  });

  // Clean up R2 files and database records
  // ... cleanup logic
};
```

#### Frontend Changes

##### 1. Enhanced BusinessDocumentUpload Component (`apps/web/src/components/vendor/BusinessDocumentUpload.tsx`)

- **Replacement Warnings**: Shows warning when uploading will replace existing documents
- **Smart Messages**: Different success messages for new uploads vs. replacements
- **Visual Indicators**: Clear UI feedback about document replacement

```typescript
// Check if this was a replacement
const existingDoc = documents.find(doc => doc.documentType === documentType);
const message = existingDoc 
  ? `Document replaced successfully! Status: ${getDocumentStatusText(newDocument.status)}`
  : `Document uploaded successfully! Status: ${getDocumentStatusText(newDocument.status)}`;

// Show replacement warning in UI
{selectedDocumentType && documents.some(doc => doc.documentType === selectedDocumentType) && (
  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
    <p className="text-xs text-yellow-700">
      ⚠️ This will replace your existing {DOCUMENT_TYPE_LABELS[selectedDocumentType]}
    </p>
  </div>
)}
```

## Benefits

### ✅ **Prevents Duplicates**
- No more duplicate files in R2 storage
- No more duplicate database records
- Maintains data integrity

### ✅ **Cost Savings**
- Reduces R2 storage costs
- Eliminates orphaned files
- Optimizes storage usage

### ✅ **Better User Experience**
- Clear warnings about document replacement
- Consistent success messages
- Visual feedback during uploads

### ✅ **Admin Benefits**
- Automatic cleanup of abandoned records
- Better document management
- Reduced manual intervention

## Usage Examples

### Scenario 1: First Time Upload
```
User uploads CAC certificate → New document created
Result: ✅ Document uploaded successfully! Status: Pending Review
```

### Scenario 2: Document Replacement
```
User uploads new CAC certificate → Existing document updated
Result: ✅ Document replaced successfully! Status: Pending Review
```

### Scenario 3: Abandoned Application
```
User uploads documents but doesn't submit → Records marked as 'draft'
After 7 days → Automatic cleanup removes abandoned records
```

## Testing

### Manual Testing
1. Upload a business document
2. Upload the same document type again
3. Verify old file is replaced, not duplicated
4. Check R2 storage for orphaned files

### Automated Testing
Run the test script: `npm run test:document-deduplication`

```bash
cd apps/api
npm run test:document-deduplication
```

## Configuration

### Cleanup Settings
- **Abandoned Record Threshold**: 7 days (configurable)
- **Cleanup Endpoint**: Admin only (`POST /api/v1/business-documents/cleanup`)
- **Automatic Cleanup**: Can be scheduled via cron job

### R2 Storage
- **File Deletion**: Automatic when documents are replaced
- **Key Generation**: Consistent naming convention for easy cleanup
- **Error Handling**: Graceful fallback if cleanup fails

## Monitoring

### Logs to Watch
- Document replacement operations
- R2 file cleanup operations
- Abandoned record cleanup operations

### Metrics to Track
- Document replacement frequency
- Storage cost savings
- Cleanup operation success rate

## Future Enhancements

### Phase 2: Advanced Cleanup
- **Scheduled Cleanup**: Automated daily cleanup jobs
- **Smart Thresholds**: Dynamic cleanup based on storage usage
- **User Notifications**: Alert users about abandoned applications

### Phase 3: Analytics
- **Upload Patterns**: Track user behavior
- **Storage Analytics**: Monitor cost savings
- **Performance Metrics**: Measure system efficiency

## Conclusion

The document deduplication system successfully addresses the duplicate document problem by:

1. **Preventing duplicates** through smart upload logic
2. **Cleaning up orphaned files** automatically
3. **Providing clear user feedback** about replacements
4. **Maintaining data integrity** across the system

This implementation ensures that users can safely abandon and return to the vendor application form without creating duplicate documents, while maintaining a clean and efficient storage system. 