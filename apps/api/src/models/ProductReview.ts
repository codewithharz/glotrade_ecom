// src/models/ProductReview.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProductReviewDocument extends Document {
  product: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  rating: number;
  comment?: string;
  images?: string[];
  likes: number;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productReviewSchema = new Schema<IProductReviewDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    images: [{ type: String }],
    likes: { type: Number, default: 0 },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model<IProductReviewDocument>(
  "ProductReview",
  productReviewSchema
);

