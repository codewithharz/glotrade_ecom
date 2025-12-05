// src/middleware/vendorAuth.ts
// Express types handled by any
import { AuthRequest } from "./auth";
import { UnauthorizedError } from "../utils/errors";
import Seller from "../models/Seller";

export const requireApprovedVendor = () => {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      // Bypass for Admin/SuperAdmin
      if (req.user.role === 'admin' || req.user.isSuperAdmin) {
        return next();
      }

      // Check if user has a seller application
      const sellerDoc = await Seller.findOne({ userId: req.user.id });

      if (!sellerDoc) {
        throw new UnauthorizedError("Vendor application not found. Please apply to become a vendor first.");
      }

      // Check if vendor is approved
      if (sellerDoc.status !== "approved") {
        if (sellerDoc.status === "pending") {
          throw new UnauthorizedError("Your vendor application is pending admin approval. You cannot access vendor features until approved.");
        } else if (sellerDoc.status === "rejected") {
          throw new UnauthorizedError("Your vendor application was rejected. Please contact support for more information.");
        } else if (sellerDoc.status === "draft") {
          throw new UnauthorizedError("Your vendor application is incomplete. Please complete and submit your application.");
        } else {
          throw new UnauthorizedError("Your vendor account status is invalid. Please contact support.");
        }
      }

      // Add seller info to request for use in controllers
      (req as any).seller = sellerDoc;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware for routes that should be accessible to pending vendors (like checking status)
export const requireVendorApplication = () => {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      // Bypass for Admin/SuperAdmin
      if (req.user.role === 'admin' || req.user.isSuperAdmin) {
        return next();
      }

      // Check if user has a seller application
      const sellerDoc = await Seller.findOne({ userId: req.user.id });

      if (!sellerDoc) {
        throw new UnauthorizedError("Vendor application not found. Please apply to become a vendor first.");
      }

      // Add seller info to request for use in controllers
      (req as any).seller = sellerDoc;
      next();
    } catch (error) {
      next(error);
    }
  };
}; 