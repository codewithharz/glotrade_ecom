import mongoose, { Document, Schema } from "mongoose";

export interface ICreditRequest extends Document {
    userId: Schema.Types.ObjectId;
    requestedAmount: number; // in kobo
    currency: "NGN";
    status: "pending" | "approved" | "rejected" | "cancelled";
    businessReason: string;
    supportingDocuments?: string[]; // URLs to uploaded documents

    // Admin review
    reviewedBy?: Schema.Types.ObjectId;
    reviewedAt?: Date;
    approvedAmount?: number; // in kobo (may differ from requested)
    adminNotes?: string;
    rejectionReason?: string;

    createdAt: Date;
    updatedAt: Date;
}

const creditRequestSchema = new Schema<ICreditRequest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        requestedAmount: {
            type: Number,
            required: true,
            min: 5000000, // ₦50,000 minimum
            max: 1000000000 // ₦10,000,000 maximum
        },
        currency: {
            type: String,
            enum: ["NGN"],
            default: "NGN",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
            required: true,
            index: true
        },
        businessReason: {
            type: String,
            required: true,
            minlength: 20,
            maxlength: 1000
        },
        supportingDocuments: {
            type: [String],
            default: []
        },

        // Admin review fields
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        reviewedAt: {
            type: Date
        },
        approvedAmount: {
            type: Number,
            min: 0
        },
        adminNotes: {
            type: String,
            maxlength: 1000
        },
        rejectionReason: {
            type: String,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
);

// Indexes for efficient querying
creditRequestSchema.index({ userId: 1, status: 1 });
creditRequestSchema.index({ status: 1, createdAt: -1 });
creditRequestSchema.index({ createdAt: -1 });

// Prevent multiple pending requests from same user
creditRequestSchema.index(
    { userId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "pending" }
    }
);

export default mongoose.model<ICreditRequest>("CreditRequest", creditRequestSchema);
