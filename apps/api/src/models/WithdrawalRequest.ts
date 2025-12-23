import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawalRequest extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number; // in Naira
    currency: string;
    bankDetails: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        bankCode?: string;
    };
    status: "pending" | "approved" | "rejected" | "processing" | "completed" | "failed";
    adminNote?: string;
    transactionId?: mongoose.Types.ObjectId;
    reference: string;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}

const WithdrawalRequestSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: "NGN" },
        bankDetails: {
            bankName: { type: String, required: true },
            accountNumber: { type: String, required: true },
            accountName: { type: String, required: true },
            bankCode: { type: String },
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "processing", "completed", "failed"],
            default: "pending",
        },
        adminNote: { type: String },
        transactionId: { type: Schema.Types.ObjectId, ref: "WalletTransaction" },
        reference: { type: String, required: true, unique: true },
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

// Indexes
WithdrawalRequestSchema.index({ userId: 1, createdAt: -1 });
WithdrawalRequestSchema.index({ status: 1 });
WithdrawalRequestSchema.index({ reference: 1 }, { unique: true });

export default mongoose.model<IWithdrawalRequest>("WithdrawalRequest", WithdrawalRequestSchema);
