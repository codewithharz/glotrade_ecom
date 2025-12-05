// Express types handled by any
import { BaseController } from "./BaseController";
import { VoucherService, CreateVoucherData } from "../services/VoucherService";
import { IVoucher } from "../models/Voucher";
import { getUserIdFromToken } from "../middleware/auth";
import User from "../models/User";

export class VoucherController extends BaseController<IVoucher> {
  private voucherService: VoucherService;

  constructor() {
    super(new VoucherService());
    this.voucherService = new VoucherService();
  }

  // Create a new voucher (for sellers and admins)
  createVoucher = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const {
        code,
        type,
        value,
        minOrderAmount,
        maxDiscount,
        maxUsage,
        validFrom,
        validUntil,
        applicableProducts,
        applicableCategories,
        applicableUsers,
        userUsageLimit,
        description,
        terms,
      } = req.body;

      // Determine creator type based on user role
      const user = await User.findById(userId);
      const createdByType = user?.role === "admin" ? "admin" : "seller";

      const voucherData: CreateVoucherData = {
        code,
        type,
        value,
        minOrderAmount,
        maxDiscount,
        maxUsage,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: new Date(validUntil),
        createdBy: userId,
        createdByType,
        applicableProducts,
        applicableCategories,
        applicableUsers,
        userUsageLimit,
        description,
        terms,
      };

      const voucher = await this.voucherService.createVoucher(voucherData);

      res.status(201).json({
        status: "success",
        data: voucher,
        message: "Voucher created successfully",
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Validate a voucher code
  validateVoucher = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const { code, orderAmount, productIds } = req.body;

      if (!code || !orderAmount) {
        return res.status(400).json({
          status: "error",
          message: "Voucher code and order amount are required",
        });
      }

      const result = await this.voucherService.validateVoucher(
        code,
        userId,
        orderAmount,
        productIds
      );

      if (result.isValid) {
        res.status(200).json({
          status: "success",
          data: {
            isValid: true,
            voucher: result.voucher,
            discountAmount: result.discount,
            error: undefined
          },
          message: "Voucher is valid",
        });
      } else {
        res.status(400).json({
          status: "error",
          data: {
            isValid: false,
            voucher: undefined,
            discountAmount: 0,
            error: result.error || "Invalid voucher"
          },
          message: result.error || "Invalid voucher",
        });
      }
    } catch (error: any) {
      next(error);
    }
  };

  // Redeem a voucher
  redeemVoucher = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const { code, orderId } = req.body;

      if (!code || !orderId) {
        return res.status(400).json({
          status: "error",
          message: "Voucher code and order ID are required",
        });
      }

      const voucher = await this.voucherService.redeemVoucher(
        code,
        userId,
        orderId
      );

      res.status(200).json({
        status: "success",
        data: voucher,
        message: "Voucher redeemed successfully",
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Record voucher usage when applied during checkout
  recordVoucherUsage = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          status: "error",
          message: "Voucher code is required",
        });
      }

      const voucher = await this.voucherService.recordVoucherUsage(
        code,
        userId
      );

      res.status(200).json({
        status: "success",
        data: voucher,
        message: "Voucher usage recorded successfully",
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Get vouchers created by the current user (seller/admin)
  getMyVouchers = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const user = await User.findById(userId);
      const createdByType = user?.role === "admin" ? "admin" : "seller";

      const vouchers = await this.voucherService.getVouchersByCreator(
        userId,
        createdByType
      );

      res.status(200).json({
        status: "success",
        data: vouchers,
        count: vouchers.length,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Get available vouchers for the current user (buyer)
  getAvailableVouchers = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const vouchers = await this.voucherService.getVouchersForUser(userId);

      res.status(200).json({
        status: "success",
        data: vouchers,
        count: vouchers.length,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Get all active vouchers (admin only)
  getAllActiveVouchers = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const user = await User.findById(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({
          status: "error",
          message: "Admin access required",
        });
      }

      const vouchers = await this.voucherService.getActiveVouchers();

      res.status(200).json({
        status: "success",
        data: vouchers,
        count: vouchers.length,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Deactivate a voucher
  deactivateVoucher = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const { voucherId } = req.params;

      await this.voucherService.deactivateVoucher(voucherId, userId);

      res.status(200).json({
        status: "success",
        message: "Voucher deactivated successfully",
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Activate a voucher
  activateVoucher = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const { voucherId } = req.params;

      await this.voucherService.activateVoucher(voucherId, userId);

      res.status(200).json({
        status: "success",
        message: "Voucher activated successfully",
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Get voucher statistics
  getVoucherStats = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const { voucherId } = req.params;

      const stats = await this.voucherService.getVoucherStats(voucherId);

      res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Generate a unique voucher code
  generateCode = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const code = await this.voucherService.generateUniqueCode();

      res.status(200).json({
        status: "success",
        data: { code },
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Get user's voucher usage history
  getUserVoucherUsage = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const usageData = await this.voucherService.getUserVoucherUsage(userId);

      res.status(200).json({
        status: "success",
        data: usageData,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Get voucher by ID
  getVoucherById = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { voucherId } = req.params;

      const voucher = await this.voucherService.findById(voucherId);
      if (!voucher) {
        return res.status(404).json({
          status: "error",
          message: "Voucher not found",
        });
      }

      res.status(200).json({
        status: "success",
        data: voucher,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Update voucher
  updateVoucher = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const { voucherId } = req.params;
      const updateData = req.body;

      // Check if user owns this voucher or is admin
      const voucher = await this.voucherService.findById(voucherId);
      if (!voucher) {
        return res.status(404).json({
          status: "error",
          message: "Voucher not found",
        });
      }

      const user = await User.findById(userId);
      if (voucher.createdBy.toString() !== userId && user?.role !== "admin") {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      // Remove fields that shouldn't be updated
      delete updateData.code;
      delete updateData.createdBy;
      delete updateData.createdByType;
      delete updateData.usedCount;

      const updatedVoucher = await this.voucherService.findByIdAndUpdate(
        voucherId,
        updateData,
        { new: true }
      );

      res.status(200).json({
        status: "success",
        data: updatedVoucher,
        message: "Voucher updated successfully",
      });
    } catch (error: any) {
      next(error);
    }
  };
} 