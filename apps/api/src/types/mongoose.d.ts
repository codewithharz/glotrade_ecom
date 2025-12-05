// src/types/mongoose.d.ts
import { Document, Model } from "mongoose";

declare module "mongoose" {
  interface Document {
    _id: any;
  }
}
