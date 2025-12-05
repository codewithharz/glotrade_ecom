// Express types handled by any
import { AuthRequest } from "../middleware/auth";
import { ValidationError } from "../utils/errors";
import BusinessDocument from "../models/BusinessDocument";
import Seller from "../models/Seller";
import { R2Service } from "../services/R2Service";
import mongoose from "mongoose";

export class BusinessDocumentController {
  private r2Service: R2Service;

  constructor() {
    this.r2Service = new R2Service();
  }

  /**
   * Upload a business document
   * POST /api/v1/business-documents/upload
   */
  uploadDocument = async (req: any, res: any, next: any) => {
    try {
      console.log('Upload request received:', {
        user: req.user?.id,
        hasFile: !!req.file,
        fileInfo: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : null,
        body: req.body,
        headers: req.headers
      });

      if (!req.user) throw new ValidationError("Authentication required");
      if (!req.file) throw new ValidationError("No file uploaded");

      const { documentType, vendorId } = req.body;
      
      if (!documentType) throw new ValidationError("Document type is required");
      if (!vendorId) throw new ValidationError("Vendor ID is required");

      // Validate that the user is uploading for themselves or is an admin
      if (req.user.role !== 'admin' && req.user.id !== vendorId) {
        throw new ValidationError("Unauthorized to upload documents for this vendor");
      }

      // Validate file
      const validation = this.r2Service.validateBusinessDocument(req.file);
      if (!validation.isValid) {
        throw new ValidationError(validation.error || "Invalid file");
      }

      // Check if vendor exists or is applying to become a vendor
      let vendor = await Seller.findOne({ userId: vendorId });
      
      // If no Seller record exists, check if user is in the process of applying
      if (!vendor) {
        // Check if user exists and allow document uploads during application process
        const user = await mongoose.model("User").findById(vendorId);
        if (!user) {
          throw new ValidationError("User not found");
        }
        
        // Create a temporary Seller record for document upload
        // Use a placeholder name if store name doesn't exist yet
        const storeName = user.store?.name || `Vendor_${user.username || user.email?.split('@')[0] || 'User'}`;
        
        vendor = await Seller.create({
          userId: vendorId,
          slug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: storeName,
          description: user.store?.description || '',
          logoUrl: user.store?.logoUrl || user.profileImage || '',
          country: user.country || 'NG',
          status: 'draft', // Mark as draft since it's not submitted yet
          kyc: {},
          business: {},
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('Created temporary Seller record for document upload:', vendor._id);
      }

      // Generate R2 key and upload file
      const key = this.r2Service.generateBusinessDocumentKey(vendorId, documentType, req.file.originalname);
      const uploadResult = await this.r2Service.uploadFile(
        req.file.buffer,
        key,
        req.file.mimetype,
        {
          originalName: req.file.originalname,
          uploadedBy: req.user.id,
          documentType
        }
      );

      // Check for existing document of the same type
      let document = await BusinessDocument.findOne({ 
        vendorId, 
        documentType 
      });

      let oldFileUrl: string | null = null;

      if (document) {
        // Store old file URL for cleanup
        oldFileUrl = document.fileUrl;
        
        // Update existing document
        document.fileName = uploadResult.url.split('/').pop() || req.file.originalname;
        document.fileUrl = uploadResult.url;
        document.fileSize = uploadResult.size;
        document.mimeType = uploadResult.mimeType;
        document.status = 'pending'; // Reset to pending for review
        document.rejectionReason = undefined; // Clear any previous rejection
        document.verifiedBy = undefined;
        document.verifiedAt = undefined;
        document.metadata = {
          ...document.metadata,
          originalName: req.file.originalname,
          uploadDate: new Date(),
          replacedAt: new Date(),
          previousFileUrl: oldFileUrl
        };
        await document.save();
        
        console.log(`Updated existing ${documentType} document for vendor ${vendorId}`);
      } else {
        // Create new document
        document = await BusinessDocument.create({
          vendorId,
          documentType,
          fileName: uploadResult.url.split('/').pop() || req.file.originalname,
          fileUrl: uploadResult.url,
          fileSize: uploadResult.size,
          mimeType: uploadResult.mimeType,
          status: 'pending',
          metadata: {
            originalName: req.file.originalname,
            uploadDate: new Date()
          }
        });
        
        console.log(`Created new ${documentType} document for vendor ${vendorId}`);
      }

      // Clean up old file from R2 if it exists
      if (oldFileUrl) {
        try {
          // Extract the key from the old URL for deletion
          const oldKey = oldFileUrl.split('/').slice(-3).join('/'); // Get the last 3 parts: vendorId/documentType/filename
          await this.r2Service.deleteFile(oldKey);
          console.log(`Deleted old file from R2: ${oldKey}`);
        } catch (cleanupError) {
          console.error('Failed to cleanup old file from R2:', cleanupError);
          // Don't fail the upload if cleanup fails
        }
      }

      res.json({
        status: 'success',
        data: {
          document,
          message: 'Document uploaded successfully and pending admin review'
        }
      });

    } catch (e) {
      next(e as any);
    }
  };

  /**
   * Get documents for a vendor
   * GET /api/v1/business-documents/vendor/:vendorId
   */
  getVendorDocuments = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const { vendorId } = req.params;
      
      // Check if user is authorized to view these documents
      if (req.user.role !== 'admin' && (req.user as any)._id.toString() !== vendorId) {
        throw new ValidationError("Unauthorized to view these documents");
      }

      const documents = await BusinessDocument.find({ vendorId })
        .sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: documents
      });

    } catch (e) {
      next(e as any);
    }
  };

  /**
   * Get all pending documents (admin only)
   * GET /api/v1/business-documents/pending
   */
  getPendingDocuments = async (req: any, res: any, next: any) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw new ValidationError("Admin access required");
      }

      const { page = 1, limit = 20, documentType, vendorId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = { status: 'pending' };
      if (documentType) filter.documentType = documentType;
      if (vendorId) filter.vendorId = vendorId;

      const [documents, total] = await Promise.all([
        BusinessDocument.find(filter)
          .populate('vendorId', 'name slug country')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        BusinessDocument.countDocuments(filter)
      ]);

      res.json({
        status: 'success',
        data: {
          documents,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (e) {
      next(e as any);
    }
  };

  /**
   * Update document status (admin only)
   * PUT /api/v1/business-documents/:id/status
   */
  updateDocumentStatus = async (req: any, res: any, next: any) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw new ValidationError("Admin access required");
      }

      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      if (!['verified', 'rejected'].includes(status)) {
        throw new ValidationError("Invalid status. Must be 'verified' or 'rejected'");
      }

      if (status === 'rejected' && !rejectionReason) {
        throw new ValidationError("Rejection reason is required when rejecting a document");
      }

      const document = await BusinessDocument.findById(id);
      if (!document) {
        throw new ValidationError("Document not found");
      }

      // Update document status
      document.status = status;
      document.verifiedBy = req.user.id;
      document.verifiedAt = new Date();
      
      if (status === 'rejected') {
        document.rejectionReason = rejectionReason;
      } else {
        document.rejectionReason = undefined;
      }

      await document.save();

      res.json({
        status: 'success',
        data: {
          document,
          message: `Document ${status} successfully`
        }
      });

    } catch (e) {
      next(e as any);
    }
  };

  /**
   * Delete a document
   * DELETE /api/v1/business-documents/:id
   */
  deleteDocument = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const { id } = req.params;
      const document = await BusinessDocument.findById(id);
      
      if (!document) {
        throw new ValidationError("Document not found");
      }

      // Check if user is authorized to delete this document
      if (req.user.role !== 'admin' && req.user.id !== document.vendorId.toString()) {
        throw new ValidationError("Unauthorized to delete this document");
      }

      // Delete from R2
      const key = document.fileUrl.split('/').pop();
      if (key) {
        await this.r2Service.deleteFile(key);
      }

      // Delete from database
      await BusinessDocument.findByIdAndDelete(id);

      res.json({
        status: 'success',
        message: 'Document deleted successfully'
      });

    } catch (e) {
      next(e as any);
    }
  };

  /**
   * Get document statistics (admin only)
   * GET /api/v1/business-documents/stats
   */
  getDocumentStats = async (req: any, res: any, next: any) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw new ValidationError("Admin access required");
      }

      const [totalDocuments, pendingCount, verifiedCount, rejectedCount] = await Promise.all([
        BusinessDocument.countDocuments(),
        BusinessDocument.countDocuments({ status: 'pending' }),
        BusinessDocument.countDocuments({ status: 'verified' }),
        BusinessDocument.countDocuments({ status: 'rejected' })
      ]);

      const documentTypeStats = await BusinessDocument.aggregate([
        {
          $group: {
            _id: '$documentType',
            count: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            verified: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          }
        }
      ]);

      res.json({
        status: 'success',
        data: {
          total: totalDocuments,
          pending: pendingCount,
          verified: verifiedCount,
          rejected: rejectedCount,
          byType: documentTypeStats
        }
      });

    } catch (e) {
      next(e as any);
    }
  };

  /**
   * Clean up abandoned temporary records (admin only)
   * POST /api/v1/business-documents/cleanup
   */
  cleanupAbandonedRecords = async (req: any, res: any, next: any) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw new ValidationError("Admin access required");
      }

      // Find temporary Seller records that are older than 7 days and still in 'draft' status
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const abandonedSellers = await Seller.find({
        status: 'draft',
        createdAt: { $lt: cutoffDate }
      });

      let cleanedCount = 0;
      let r2CleanupCount = 0;

      for (const seller of abandonedSellers) {
        try {
          // Find all documents for this abandoned seller
          const documents = await BusinessDocument.find({ vendorId: seller._id });
          
          // Delete documents from R2
          for (const doc of documents) {
            try {
              const key = doc.fileUrl.split('/').slice(-3).join('/');
              await this.r2Service.deleteFile(key);
              r2CleanupCount++;
            } catch (r2Error) {
              console.error(`Failed to delete R2 file for document ${doc._id}:`, r2Error);
            }
          }

          // Delete BusinessDocument records
          await BusinessDocument.deleteMany({ vendorId: seller._id });
          
          // Delete the abandoned Seller record
          await Seller.deleteOne({ _id: seller._id });
          
          cleanedCount++;
          console.log(`Cleaned up abandoned seller: ${seller._id}`);
        } catch (sellerError) {
          console.error(`Failed to cleanup seller ${seller._id}:`, sellerError);
        }
      }

      res.json({
        status: 'success',
        data: {
          message: `Cleanup completed. Removed ${cleanedCount} abandoned sellers and ${r2CleanupCount} R2 files.`,
          cleanedSellers: cleanedCount,
          cleanedR2Files: r2CleanupCount
        }
      });

    } catch (e) {
      next(e as any);
    }
  };
}

export default new BusinessDocumentController(); 