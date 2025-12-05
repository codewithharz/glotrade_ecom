import { Document } from "mongoose";

export interface ICategory extends Document {
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

export interface IProductReview extends Document {
  product: string;
  user: string;
  rating: number;
  comment?: string;
  images?: string[];
  likes: number;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}
