import mongoose, { Document, Schema } from "mongoose";

export interface ISecurityReport extends Document {
  userId?: mongoose.Types.ObjectId;
  reportType: "communication" | "website" | "jobs";
  status: "pending" | "investigating" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  
  // Common fields
  description: string;
  suspiciousElements: string[];
  actionTaken: string;
  additionalDetails?: string;
  reportedAt: Date;
  
  // Communication-specific fields
  communicationType?: "phone" | "email" | "sms";
  sender?: string;
  contactDate?: Date;
  contactTime?: string;
  phoneNumber?: string;
  emailAddress?: string;
  
  // Website/App-specific fields
  websiteUrl?: string;
  appName?: string;
  appStore?: string;
  
  // Job-specific fields
  companyName?: string;
  jobTitle?: string;
  platform?: string;
  
  // Investigation fields
  assignedTo?: mongoose.Types.ObjectId;
  investigationNotes?: string;
  resolution?: string;
  resolvedAt?: Date;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SecurityReportSchema = new Schema<ISecurityReport>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false // Anonymous reports allowed
  },
  reportType: {
    type: String,
    enum: ["communication", "website", "jobs"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "investigating", "resolved", "closed"],
    default: "pending"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  
  // Common fields
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  suspiciousElements: [{
    type: String,
    required: true
  }],
  actionTaken: {
    type: String,
    required: true
  },
  additionalDetails: {
    type: String,
    maxlength: 1000
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  
  // Communication-specific fields
  communicationType: {
    type: String,
    enum: ["phone", "email", "sms"]
  },
  sender: String,
  contactDate: Date,
  contactTime: String,
  phoneNumber: String,
  emailAddress: String,
  
  // Website/App-specific fields
  websiteUrl: String,
  appName: String,
  appStore: String,
  
  // Job-specific fields
  companyName: String,
  jobTitle: String,
  platform: String,
  
  // Investigation fields
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User" // Admin users
  },
  investigationNotes: String,
  resolution: String,
  resolvedAt: Date,
  
  // Metadata
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  collection: "security_reports"
});

// Indexes for efficient querying
SecurityReportSchema.index({ reportType: 1, status: 1 });
SecurityReportSchema.index({ priority: 1, createdAt: -1 });
SecurityReportSchema.index({ userId: 1, createdAt: -1 });
SecurityReportSchema.index({ status: 1, priority: 1 });

// Auto-set priority based on suspicious elements
SecurityReportSchema.pre("save", function(next) {
  if (this.isModified("suspiciousElements")) {
    const urgentElements = [
      "Asked for personal information (passwords, SSN, etc.)",
      "Demanded immediate payment",
      "Asked for gift cards or cryptocurrency",
      "Asked for bank account or payment information",
      "Asked for personal documents (passport, SSN, etc.)",
      "Asked to process payments or handle money"
    ];
    
    const hasUrgentElements = this.suspiciousElements.some(element => 
      urgentElements.includes(element)
    );
    
    if (hasUrgentElements) {
      this.priority = "urgent";
    } else if (this.suspiciousElements.length >= 5) {
      this.priority = "high";
    } else if (this.suspiciousElements.length >= 3) {
      this.priority = "medium";
    } else {
      this.priority = "low";
    }
  }
  next();
});

export const SecurityReport = mongoose.model<ISecurityReport>("SecurityReport", SecurityReportSchema); 