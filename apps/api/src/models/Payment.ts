import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  orderId?: Schema.Types.ObjectId | string; // Can be ObjectId for orders or string for wallet topups
  provider: "paystack" | "flutterwave";
  reference: string;
  amount: number; // integer (kobo)
  currency: string; // e.g., NGN
  status: "pending" | "paid" | "failed";
  settled: boolean; // vendor payouts done
  metadata?: any;
  rawWebhook?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { 
      type: Schema.Types.Mixed, 
      ref: "Order", 
      required: false, 
      index: true,
      validate: {
        validator: function(v: any) {
          // Allow ObjectId, valid ObjectId string, or custom wallet topup strings
          if (!v) return true; // optional field
          if (typeof v === 'string') {
            // Check if it's a valid ObjectId string or wallet topup string
            return /^[0-9a-fA-F]{24}$/.test(v) || v.startsWith('WALLET_TOPUP_');
          }
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'orderId must be a valid ObjectId or wallet topup identifier'
      }
    },
    provider: { type: String, enum: ["paystack", "flutterwave"], required: true, index: true },
    reference: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "NGN" },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    settled: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
    rawWebhook: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", paymentSchema);

