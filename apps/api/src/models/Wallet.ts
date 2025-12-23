import mongoose, { Document, Schema } from "mongoose";

export interface IWallet extends Document {
  userId: Schema.Types.ObjectId;
  type: "user" | "vendor"; // Note: "vendor" type deprecated for single-vendor platform
  currency: "NGN"; // Naira only for wholesaler platform
  balance: number; // in Naira
  frozenBalance: number; // for escrow, disputes, etc.
  totalDeposited: number;
  totalWithdrawn: number;
  totalSpent: number;
  totalEarned: number; // for vendors (deprecated)
  creditLimit: number; // Max credit allowed (in Naira)
  creditUsed: number; // Current credit utilized (in Naira)
  // Sales Agent Commission Tracking
  totalCommissionEarned: number; // Total commissions earned (in Naira)
  pendingCommission: number; // Commissions pending approval/payment (in Naira)
  paidCommission: number; // Commissions that have been paid out (in Naira)
  status: "active" | "suspended" | "frozen";
  frozenAt?: Date;
  unfrozenAt?: Date;
  freezeReason?: string;
  unfreezeReason?: string;
  adminNotes?: string;
  metadata?: {
    bankAccount?: {
      accountNumber: string;
      bankCode: string;
      accountName: string;
    };
    paymentProvider?: {
      paystack?: string;
      flutterwave?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["user", "vendor"], // "vendor" deprecated for single-vendor platform
      required: true,
      default: "user",
      index: true
    },
    currency: {
      type: String,
      enum: ["NGN"], // Naira only
      required: true,
      default: "NGN"
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    frozenBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDeposited: {
      type: Number,
      default: 0,
      min: 0
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0
    },
    creditUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    // Sales Agent Commission Tracking
    totalCommissionEarned: {
      type: Number,
      default: 0,
      min: 0
    },
    pendingCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    paidCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ["active", "suspended", "frozen"],
      default: "active"
    },
    frozenAt: {
      type: Date
    },
    unfrozenAt: {
      type: Date
    },
    freezeReason: {
      type: String
    },
    unfreezeReason: {
      type: String
    },
    adminNotes: {
      type: String
    },
    metadata: {
      bankAccount: {
        accountNumber: String,
        bankCode: String,
        accountName: String,
      },
      paymentProvider: {
        paystack: String,
        flutterwave: String,
      },
    },
  },
  { timestamps: true }
);

// Compound indexes
walletSchema.index({ userId: 1, type: 1, currency: 1 }, { unique: true });
walletSchema.index({ status: 1 });
walletSchema.index({ createdAt: -1 });

export default mongoose.model<IWallet>("Wallet", walletSchema);
