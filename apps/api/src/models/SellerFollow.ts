import mongoose, { Schema, Document } from "mongoose";

export interface ISellerFollow extends Document {
  userId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  createdAt: Date;
}

const sellerFollowSchema = new Schema<ISellerFollow>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

sellerFollowSchema.index({ userId: 1, sellerId: 1 }, { unique: true });

export default mongoose.model<ISellerFollow>("SellerFollow", sellerFollowSchema);

