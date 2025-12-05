import mongoose, { Document, Schema } from "mongoose";

export interface IPayout extends Document {
  orderId: Schema.Types.ObjectId;
  vendorId: Schema.Types.ObjectId;
  provider: "paystack" | "flutterwave";
  recipientCode: string;
  amountGross: number; // kobo
  feePlatform2p: number; // kobo
  amountNet: number; // kobo
  transferId?: string;
  status: "queued" | "processing" | "paid" | "failed";
  attempts: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const payoutSchema = new Schema<IPayout>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: ["paystack", "flutterwave"], required: true },
    recipientCode: { type: String, required: true },
    amountGross: { type: Number, required: true },
    feePlatform2p: { type: Number, required: true },
    amountNet: { type: Number, required: true },
    transferId: { type: String },
    status: { type: String, enum: ["queued", "processing", "paid", "failed"], default: "queued" },
    attempts: { type: Number, default: 0 },
    lastError: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPayout>("Payout", payoutSchema);

