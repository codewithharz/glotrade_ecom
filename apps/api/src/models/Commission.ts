// apps/api/src/models/Commission.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICommission extends Document {
    agentId: Schema.Types.ObjectId;
    referralId: Schema.Types.ObjectId;
    orderId?: Schema.Types.ObjectId;
    type: "registration" | "purchase" | "bonus" | "tier_upgrade";
    amount: number; // in kobo
    status: "pending" | "approved" | "paid" | "rejected";
    calculatedAt: Date;
    approvedAt?: Date;
    approvedBy?: Schema.Types.ObjectId;
    paidAt?: Date;
    rejectedAt?: Date;
    rejectedBy?: Schema.Types.ObjectId;
    rejectionReason?: string;
    description: string;
    metadata: {
        orderValue?: number;
        commissionRate?: number;
        autoApproved?: boolean;
        paymentReference?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const commissionSchema = new Schema<ICommission>(
    {
        agentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        referralId: {
            type: Schema.Types.ObjectId,
            ref: "Referral",
            required: true,
            index: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            index: true,
        },
        type: {
            type: String,
            enum: ["registration", "purchase", "bonus", "tier_upgrade"],
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "paid", "rejected"],
            default: "pending",
            required: true,
            index: true,
        },
        calculatedAt: {
            type: Date,
            default: Date.now,
        },
        approvedAt: {
            type: Date,
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        paidAt: {
            type: Date,
        },
        rejectedAt: {
            type: Date,
        },
        rejectedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        rejectionReason: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        metadata: {
            orderValue: Number,
            commissionRate: Number,
            autoApproved: Boolean,
            paymentReference: String,
        },
    },
    { timestamps: true }
);

// Compound indexes for efficient queries
commissionSchema.index({ agentId: 1, status: 1, calculatedAt: -1 });
commissionSchema.index({ referralId: 1, type: 1 });
commissionSchema.index({ orderId: 1 }, { sparse: true });
commissionSchema.index({ status: 1, calculatedAt: -1 });

export default mongoose.model<ICommission>("Commission", commissionSchema);
