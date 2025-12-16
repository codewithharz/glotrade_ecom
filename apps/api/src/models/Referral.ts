// apps/api/src/models/Referral.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IReferral extends Document {
    agentId: Schema.Types.ObjectId;
    referredUserId: Schema.Types.ObjectId;
    referralCode: string;
    status: "pending" | "active" | "inactive";
    registeredAt: Date;
    firstPurchaseAt?: Date;
    totalOrders: number;
    totalOrderValue: number; // in kobo
    totalCommissionGenerated: number; // in kobo
    metadata: {
        source?: string; // social, email, direct, etc.
        campaign?: string;
        ipAddress?: string;
        userAgent?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
    {
        agentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        referredUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // Each user can only be referred once
            index: true,
        },
        referralCode: {
            type: String,
            required: true,
            uppercase: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["pending", "active", "inactive"],
            default: "pending",
            index: true,
        },
        registeredAt: {
            type: Date,
            default: Date.now,
        },
        firstPurchaseAt: {
            type: Date,
        },
        totalOrders: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalOrderValue: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalCommissionGenerated: {
            type: Number,
            default: 0,
            min: 0,
        },
        metadata: {
            source: String,
            campaign: String,
            ipAddress: String,
            userAgent: String,
        },
    },
    { timestamps: true }
);

// Compound indexes for efficient queries
referralSchema.index({ agentId: 1, status: 1, createdAt: -1 });
referralSchema.index({ referralCode: 1, referredUserId: 1 });

export default mongoose.model<IReferral>("Referral", referralSchema);
