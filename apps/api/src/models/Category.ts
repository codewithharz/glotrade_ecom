// src/models/Category.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryDocument extends Document {
  name: string;
  description?: string;
  parentId?: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
  productCount: number;
  subCategories?: string[];
  attributes?: {
    name: string;
    type: "text" | "number" | "boolean" | "select";
    required: boolean;
    options?: string[];
  }[];
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
    parentId: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
    productCount: { type: Number, default: 0 },
    subCategories: [{ type: String }],
    attributes: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "number", "boolean", "select"],
          required: true,
        },
        required: { type: Boolean, default: false },
        options: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

export default mongoose.model<ICategoryDocument>("Category", categorySchema);

