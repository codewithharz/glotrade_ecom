import mongoose, { Document, Schema } from "mongoose";

export interface IBusinessDocument extends Document {
  vendorId: Schema.Types.ObjectId; // Reference to Seller
  documentType: 'cac_certificate' | 'business_license' | 'tax_certificate' | 'id_card' | 'utility_bill' | 'bank_statement' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  verifiedBy?: Schema.Types.ObjectId; // Admin who verified
  verifiedAt?: Date;
  metadata?: {
    originalName: string;
    uploadDate: Date;
    fileHash?: string; // For integrity verification
    country?: string; // Country where document was issued
    expiryDate?: Date; // If document has expiry
    replacedAt?: Date; // When document was replaced
    previousFileUrl?: string; // URL of the previous file that was replaced
    [key: string]: any; // Allow additional properties for flexibility
  };
  createdAt: Date;
  updatedAt: Date;
}

const businessDocumentSchema = new Schema<IBusinessDocument>(
  {
    vendorId: { 
      type: Schema.Types.ObjectId, 
      ref: "Seller", 
      required: true, 
      index: true 
    },
    documentType: { 
      type: String, 
      enum: ['cac', 'cac_certificate', 'business_license', 'tax_id', 'tax_certificate', 'business_address', 'id_card', 'utility_bill', 'bank_statement', 'other'],
      required: true 
    },
    fileName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    fileUrl: { 
      type: String, 
      required: true 
    },
    fileSize: { 
      type: Number, 
      required: true,
      min: 0 
    },
    mimeType: { 
      type: String, 
      required: true,
      enum: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    },
    status: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'pending',
      index: true
    },
    rejectionReason: { 
      type: String,
      trim: true
    },
    verifiedBy: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    },
    verifiedAt: { 
      type: Date 
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { 
    timestamps: true
  }
);

// Add indexes after schema creation
businessDocumentSchema.index({ vendorId: 1, documentType: 1 });
businessDocumentSchema.index({ vendorId: 1, status: 1 });
businessDocumentSchema.index({ status: 1, createdAt: 1 });

// Pre-save middleware to ensure fileHash is set if not provided
businessDocumentSchema.pre('save', function(this: any, next) {
  if (!this.metadata?.fileHash && this.fileUrl) {
    // Generate a simple hash from fileUrl for basic integrity
    this.metadata = this.metadata || {};
    this.metadata.fileHash = Buffer.from(this.fileUrl).toString('base64').substring(0, 16);
  }
  next();
});

// Virtual for document type display name
businessDocumentSchema.virtual('documentTypeDisplay').get(function(this: any) {
  const displayNames: Record<string, string> = {
    'cac': 'CAC Certificate',
    'cac_certificate': 'CAC Certificate',
    'business_license': 'Business License',
    'tax_id': 'Tax ID',
    'tax_certificate': 'Tax Certificate',
    'business_address': 'Business Address Proof',
    'id_card': 'ID Card',
    'utility_bill': 'Utility Bill',
    'bank_statement': 'Bank Statement',
    'other': 'Other Document'
  };
  return displayNames[this.documentType] || this.documentType;
});

// Virtual for file size in human readable format
businessDocumentSchema.virtual('fileSizeDisplay').get(function(this: any) {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Ensure virtuals are serialized
businessDocumentSchema.set('toJSON', { virtuals: true });
businessDocumentSchema.set('toObject', { virtuals: true });

export default mongoose.model<IBusinessDocument>("BusinessDocument", businessDocumentSchema); 