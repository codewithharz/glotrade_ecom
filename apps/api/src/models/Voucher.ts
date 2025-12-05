import mongoose, { Schema, Document } from "mongoose";

export interface IVoucher extends Document {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number; // percentage (0-100) or fixed amount
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUsage: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId; // User ID (seller or admin)
  createdByType: "seller" | "admin" | "platform";
  applicableProducts?: mongoose.Types.ObjectId[]; // Specific products
  applicableCategories?: string[]; // Product categories
  applicableUsers?: mongoose.Types.ObjectId[]; // Specific users
  userUsageLimit: number; // How many times a user can use this voucher
  userUsage: Map<string, number>; // Track usage per user
  description?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    maxUsage: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByType: {
      type: String,
      enum: ["seller", "admin", "platform"],
      required: true,
    },
    applicableProducts: [{
      type: Schema.Types.ObjectId,
      ref: "Product",
    }],
    applicableCategories: [String],
    applicableUsers: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    userUsageLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    userUsage: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    description: {
      type: String,
      maxlength: 200,
    },
    terms: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
voucherSchema.index({ code: 1 });
voucherSchema.index({ isActive: 1, validUntil: 1 });
voucherSchema.index({ createdBy: 1, createdByType: 1 });
voucherSchema.index({ applicableProducts: 1 });
voucherSchema.index({ applicableCategories: 1 });
voucherSchema.index({ applicableUsers: 1 });

// Pre-save middleware to validate voucher logic
voucherSchema.pre("save", function (next) {
  // Validate percentage vouchers
  if (this.type === "percentage" && (this.value < 0 || this.value > 100)) {
    throw new Error("Percentage voucher value must be between 0 and 100");
  }
  
  // Validate fixed amount vouchers
  if (this.type === "fixed" && this.value <= 0) {
    throw new Error("Fixed amount voucher value must be greater than 0");
  }
  
  // Validate dates
  if (this.validUntil <= this.validFrom) {
    throw new Error("Valid until date must be after valid from date");
  }
  
  // Validate usage limits
  if (this.usedCount > this.maxUsage) {
    throw new Error("Used count cannot exceed max usage");
  }
  
  next();
});

// Instance methods
voucherSchema.methods.isValid = function (): boolean {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    this.usedCount < this.maxUsage
  );
};

voucherSchema.methods.canUseByUser = function (userId: string): boolean {
  const userUsage = this.userUsage.get(userId) || 0;
  return userUsage < this.userUsageLimit;
};

voucherSchema.methods.calculateDiscount = function (orderAmount: number): number {
  if (this.type === "percentage") {
    const discount = (orderAmount * this.value) / 100;
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
  } else if (this.type === "fixed") {
    return Math.min(this.value, orderAmount);
  } else if (this.type === "free_shipping") {
    // This would be handled separately in shipping calculation
    return 0;
  }
  return 0;
};

voucherSchema.methods.recordUsage = function (userId: string): void {
  this.usedCount += 1;
  const currentUsage = this.userUsage.get(userId) || 0;
  this.userUsage.set(userId, currentUsage + 1);
};

// Static methods
voucherSchema.statics.findValidVoucher = function (code: string, userId: string, orderAmount: number) {
  return this.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
    usedCount: { $lt: "$maxUsage" },
    $or: [
      { applicableUsers: { $in: [userId] } },
      { applicableUsers: { $exists: false } },
      { applicableUsers: { $size: 0 } }
    ]
  });
};

const Voucher = mongoose.model<IVoucher>("Voucher", voucherSchema);

export default Voucher; 