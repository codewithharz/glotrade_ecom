import { Router } from "express";
import businessDocumentController from "../controllers/businessDocument.controller";
import { auth } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import { UserService } from "../services/UserService";
import multer from "multer";

const router = Router();
const userService = new UserService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF and image files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// All routes require authentication
router.use(auth(userService));

// ==================== VENDOR DOCUMENT MANAGEMENT ====================

/**
 * POST /api/v1/business-documents/upload
 * Upload a business document
 * Body: documentType, vendorId
 * File: document file (PDF, JPG, PNG)
 */
router.post("/upload", upload.single('document'), businessDocumentController.uploadDocument);

/**
 * GET /api/v1/business-documents/vendor/:vendorId
 * Get all documents for a specific vendor
 */
router.get("/vendor/:vendorId", businessDocumentController.getVendorDocuments);

/**
 * DELETE /api/v1/business-documents/:id
 * Delete a specific document
 */
router.delete("/:id", businessDocumentController.deleteDocument);

// ==================== ADMIN DOCUMENT REVIEW ====================

/**
 * GET /api/v1/business-documents/pending
 * Get all pending documents for admin review
 * Query params: page, limit, documentType, vendorId
 * Admin only
 */
router.get("/pending", adminAuth, businessDocumentController.getPendingDocuments);

/**
 * PUT /api/v1/business-documents/:id/status
 * Update document status (verify/reject)
 * Body: status, rejectionReason (if rejecting)
 * Admin only
 */
router.put("/:id/status", adminAuth, businessDocumentController.updateDocumentStatus);

/**
 * GET /api/v1/business-documents/stats
 * Get document statistics for admin dashboard
 * Admin only
 */
router.get("/stats", adminAuth, businessDocumentController.getDocumentStats);

/**
 * POST /api/v1/business-documents/cleanup
 * Clean up abandoned temporary records
 * Admin only
 */
router.post("/cleanup", adminAuth, businessDocumentController.cleanupAbandonedRecords);

export default router; 