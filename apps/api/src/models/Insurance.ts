import mongoose, { Document, Schema } from "mongoose";

/**
 * Insurance - Tracks insurance coverage for TPIAs
 * Each TPIA has insurance protection for capital preservation
 */
export interface IInsurance extends Document {
    // Certificate Details
    certificateNumber: string; // "TPIA-{number}-{13 digits}"
    tpiaId: Schema.Types.ObjectId;
    tpiaNumber: number;

    // Policy Information
    policyNumber?: string; // External insurance policy number
    provider: string; // Insurance company name
    policyType: "capital_protection" | "commodity_damage" | "comprehensive";

    // Coverage
    coverageAmount: number; // Amount insured (₦)
    deductible: number; // Deductible amount
    premium: number; // Premium paid

    // Validity Period
    issueDate: Date;
    effectiveDate: Date;
    expiryDate: Date;
    renewalDate?: Date;

    // Status
    status: "active" | "expired" | "claimed" | "cancelled" | "pending";

    // Claims
    claims: {
        claimNumber: string;
        claimDate: Date;
        claimAmount: number;
        claimReason: string;
        claimStatus: "pending" | "approved" | "rejected" | "paid";
        approvedAmount?: number;
        paidDate?: Date;
        rejectionReason?: string;
    }[];

    totalClaimsAmount: number;
    totalClaimsPaid?: number;
    claimsPending?: number;
    claimsApproved?: number;
    claimsRejected?: number;

    // Documents
    documents: {
        certificate?: string; // URL to insurance certificate PDF
        policy?: string; // URL to policy document
        claims?: string[]; // URLs to claim documents
    };

    // Warehouse Association
    warehouseId?: Schema.Types.ObjectId;
    warehouseLocation?: string;

    // Partner Information
    partnerId: Schema.Types.ObjectId;
    partnerName: string;

    // Admin
    issuedBy?: Schema.Types.ObjectId; // Admin who issued
    verifiedBy?: Schema.Types.ObjectId; // Admin who verified
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

const insuranceSchema = new Schema<IInsurance>(
    {
        certificateNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        tpiaId: {
            type: Schema.Types.ObjectId,
            ref: "TPIA",
            required: true,
            index: true
        },
        tpiaNumber: {
            type: Number,
            required: true,
            index: true
        },
        policyNumber: String,
        provider: {
            type: String,
            required: true
        },
        policyType: {
            type: String,
            enum: ["capital_protection", "commodity_damage", "comprehensive"],
            default: "capital_protection"
        },
        coverageAmount: {
            type: Number,
            required: true,
            min: 0
        },
        deductible: {
            type: Number,
            default: 0,
            min: 0
        },
        premium: {
            type: Number,
            required: true,
            min: 0
        },
        issueDate: {
            type: Date,
            required: true
        },
        effectiveDate: {
            type: Date,
            required: true
        },
        expiryDate: {
            type: Date,
            required: true,
            index: true
        },
        renewalDate: Date,
        status: {
            type: String,
            enum: ["active", "expired", "claimed", "cancelled", "pending"],
            default: "pending",
            index: true
        },
        claims: [{
            claimNumber: {
                type: String,
                required: true
            },
            claimDate: {
                type: Date,
                required: true
            },
            claimAmount: {
                type: Number,
                required: true,
                min: 0
            },
            claimReason: {
                type: String,
                required: true
            },
            claimStatus: {
                type: String,
                enum: ["pending", "approved", "rejected", "paid"],
                default: "pending"
            },
            approvedAmount: Number,
            paidDate: Date,
            rejectionReason: String
        }],
        totalClaimsAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        documents: {
            certificate: String,
            policy: String,
            claims: [String]
        },
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: "Warehouse"
        },
        warehouseLocation: String,
        partnerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        partnerName: {
            type: String,
            required: true
        },
        issuedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        notes: String
    },
    { timestamps: true }
);

// Indexes
insuranceSchema.index({ status: 1, expiryDate: 1 });
insuranceSchema.index({ partnerId: 1, status: 1 });
insuranceSchema.index({ tpiaId: 1 });
insuranceSchema.index({ createdAt: -1 });

export default mongoose.model<IInsurance>("Insurance", insuranceSchema);
