import mongoose, { Document, Schema } from "mongoose";

export interface ISeller extends Document {
  userId: Schema.Types.ObjectId;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  country?: string;
  currencies?: string[];
  status: "draft" | "pending" | "approved" | "rejected";
  followers?: Schema.Types.ObjectId[];
  payoutMethods?: Array<{
    provider: "paystack" | "flutterwave" | "manual";
    country?: string;
    currency?: string;
    bankName?: string;
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
    recipientCode?: string;
    iban?: string;
    swift?: string;
    routingNumber?: string; // US
  }>;
  policies?: {
    shippingRegions?: string[];
    handlingDays?: number;
    returnPolicy?: string;
  };
  kyc?: Record<string, any>;
  business?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSchema = new Schema<ISeller>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    description: { type: String },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    country: { type: String },
    currencies: { type: [String], default: ["NGN"] },
    status: { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "pending" },
    followers: { type: [Schema.Types.ObjectId], ref: "User", default: [], index: true },
    payoutMethods: { type: [Schema.Types.Mixed], default: [] } as any,
    policies: { type: Schema.Types.Mixed },
    kyc: { type: Schema.Types.Mixed },
    business: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

sellerSchema.pre("save", function (next) {
  if (this.isModified("slug")) {
    (this as any).slug = String((this as any).slug).toLowerCase();
  }
  next();
});

export default mongoose.model<ISeller>("Seller", sellerSchema);

