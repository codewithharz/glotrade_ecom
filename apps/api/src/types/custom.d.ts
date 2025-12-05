// src/types/custom.ts
import { Request } from "express";
import { IUser } from "./user.types";

export interface AuthRequest extends Request {
  user?: IUser;
  query: any;
  params: any;
  body: any;
}
