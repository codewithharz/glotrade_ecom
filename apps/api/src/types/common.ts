// src/types/common.ts
// Express types handled by any
import { Document } from "mongoose";

export interface BaseQueryOptions {
  sort?: string;
  fields?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  results?: number;
  data: T | null;
  error?: string;
}

export interface BaseController<T extends Document> {
  getAll(req: any, res: any, next: any): Promise<void>;
  getOne(req: any, res: any, next: any): Promise<void>;
  create(req: any, res: any, next: any): Promise<void>;
  update(req: any, res: any, next: any): Promise<void>;
  delete(req: any, res: any, next: any): Promise<void>;
}
