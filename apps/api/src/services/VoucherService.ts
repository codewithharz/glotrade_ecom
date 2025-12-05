import { BaseService } from "./BaseService";
import Voucher, { IVoucher } from "../models/Voucher";
import { Types } from "mongoose";

export interface CreateVoucherData {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUsage: number;
  validFrom?: Date | string;
  validUntil: Date | string;
  createdBy: string;
  createdByType: "seller" | "admin" | "platform";
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableUsers?: string[];
  userUsageLimit?: number;
  description?: string;
  terms?: string;
}

export interface ValidateVoucherResult {
  isValid: boolean;
  voucher?: IVoucher;
  discount?: number;
  error?: string;
}

export class VoucherService extends BaseService<IVoucher> {
  constructor() {
    super(Voucher);
  }

  async createVoucher(data: CreateVoucherData): Promise<IVoucher> {
    // Validate code uniqueness
    const existingVoucher = await this.model.findOne({ code: data.code.toUpperCase() });
    if (existingVoucher) {
      throw new Error("Voucher code already exists");
    }

    // Validate dates
    const now = new Date();
    let validFrom: Date;
    
    console.log("🔍 Date Debug Info:");
    console.log("  - Input validFrom:", data.validFrom);
    console.log("  - Input validUntil:", data.validUntil);
    console.log("  - Current time:", now);
    console.log("  - validFrom type:", typeof data.validFrom);
    
    if (data.validFrom) {
      // If validFrom is provided, parse it properly
      validFrom = new Date(data.validFrom);
      console.log("  - Parsed validFrom:", validFrom);
      
      // Check if it's a date-only input (either string YYYY-MM-DD or Date object with midnight time)
      const isDateOnly = (
        (typeof data.validFrom === 'string' && data.validFrom.match(/^\d{4}-\d{2}-\d{2}$/)) ||
        (data.validFrom instanceof Date && 
         validFrom.getUTCHours() === 0 && 
         validFrom.getUTCMinutes() === 0 && 
         validFrom.getUTCSeconds() === 0 && 
         validFrom.getUTCMilliseconds() === 0)
      );
      
      if (isDateOnly) {
        console.log("  - Detected date-only format (string or midnight Date)");
        const today = new Date();
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const validFromDateOnly = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate());
        
        console.log("  - Today date only:", todayDateOnly);
        console.log("  - ValidFrom date only:", validFromDateOnly);
        console.log("  - Comparison result:", validFromDateOnly < todayDateOnly);
        
        // Only validate against past dates, not time
        if (validFromDateOnly < todayDateOnly) {
          throw new Error("Valid from date cannot be in the past");
        }
      } else {
        console.log("  - Detected datetime format with specific time");
        // For full datetime, allow a small tolerance
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        console.log("  - One minute ago:", oneMinuteAgo);
        console.log("  - Comparison result:", validFrom < oneMinuteAgo);
        
        if (validFrom < oneMinuteAgo) {
          throw new Error("Valid from date cannot be in the past");
        }
      }
    } else {
      console.log("  - No validFrom provided, using current time");
      validFrom = now;
    }
    // Parse validUntil date
    const validUntil = new Date(data.validUntil);
    
    // Check if validUntil is a date-only input (either string YYYY-MM-DD or Date object with midnight time)
    const isUntilDateOnly = (
      (typeof data.validUntil === 'string' && data.validUntil.match(/^\d{4}-\d{2}-\d{2}$/)) ||
      (data.validUntil instanceof Date && 
       validUntil.getUTCHours() === 0 && 
       validUntil.getUTCMinutes() === 0 && 
       validUntil.getUTCSeconds() === 0 && 
       validUntil.getUTCMilliseconds() === 0)
    );
    
    if (isUntilDateOnly) {
      console.log("  - ValidUntil is date-only format");
      const validFromDateOnly = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate());
      const validUntilDateOnly = new Date(validUntil.getFullYear(), validUntil.getMonth(), validUntil.getDate());
      
      console.log("  - ValidFrom date only:", validFromDateOnly);
      console.log("  - ValidUntil date only:", validUntilDateOnly);
      console.log("  - Comparison result:", validUntilDateOnly <= validFromDateOnly);
      
      if (validUntilDateOnly <= validFromDateOnly) {
        throw new Error("Valid until date must be after valid from date");
      }
    } else {
      console.log("  - ValidUntil is datetime format with specific time");
      if (validUntil <= validFrom) {
        throw new Error("Valid until date must be after valid from date");
      }
    }

    // Validate value based on type
    if (data.type === "percentage" && (data.value < 0 || data.value > 100)) {
      throw new Error("Percentage value must be between 0 and 100");
    }
    if (data.type === "fixed" && data.value <= 0) {
      throw new Error("Fixed amount must be greater than 0");
    }

    // Convert string IDs to ObjectIds
    const voucherData = {
      ...data,
      code: data.code.toUpperCase(),
      validFrom,
      applicableProducts: data.applicableProducts?.map(id => new Types.ObjectId(id)),
      applicableUsers: data.applicableUsers?.map(id => new Types.ObjectId(id)),
      userUsageLimit: data.userUsageLimit || 1,
    };

    return await this.model.create(voucherData);
  }

  async validateVoucher(
    code: string,
    userId: string,
    orderAmount: number,
    productIds?: string[]
  ): Promise<ValidateVoucherResult> {
    try {
      const voucher = await this.model.findOne({ 
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (!voucher) {
        return { isValid: false, error: "Invalid or expired voucher code" };
      }

      // Check usage limit manually
      if (voucher.usedCount >= voucher.maxUsage) {
        return { isValid: false, error: "Voucher usage limit exceeded" };
      }

      // Check if user can use this voucher
      const userUsage = voucher.userUsage.get(userId) || 0;
      if (userUsage >= voucher.userUsageLimit) {
        return { isValid: false, error: "You have already used this voucher maximum times" };
      }

      // Check minimum order amount
      if (voucher.minOrderAmount && orderAmount < voucher.minOrderAmount) {
        return { 
          isValid: false, 
          error: `Minimum order amount of ${voucher.minOrderAmount} required` 
        };
      }

      // Check if voucher applies to specific products
      if (voucher.applicableProducts && voucher.applicableProducts.length > 0) {
        if (!productIds || !productIds.some(id => 
          voucher.applicableProducts!.some(pid => pid.toString() === id)
        )) {
          return { isValid: false, error: "Voucher not applicable to selected products" };
        }
      }

      // Check if voucher applies to specific categories
      if (voucher.applicableCategories && voucher.applicableCategories.length > 0) {
        // This would need product category information from the order
        // For now, we'll skip this check
      }

      // Check if voucher applies to specific users
      if (voucher.applicableUsers && voucher.applicableUsers.length > 0) {
        if (!voucher.applicableUsers.some(uid => uid.toString() === userId)) {
          return { isValid: false, error: "Voucher not applicable to your account" };
        }
      }

      // Calculate discount
      let discount = 0;
      if (voucher.type === "percentage") {
        discount = (orderAmount * voucher.value) / 100;
        if (voucher.maxDiscount) {
          discount = Math.min(discount, voucher.maxDiscount);
        }
      } else if (voucher.type === "fixed") {
        discount = Math.min(voucher.value, orderAmount);
      }

      return {
        isValid: true,
        voucher,
        discount
      };
    } catch (error) {
      return { isValid: false, error: "Error validating voucher" };
    }
  }

  async redeemVoucher(code: string, userId: string, orderId: string): Promise<IVoucher> {
    const voucher = await this.model.findOne({ code: code.toUpperCase() });
    if (!voucher) {
      throw new Error("Voucher not found");
    }

    // Check if voucher is valid
    const now = new Date();
    if (!voucher.isActive || now < voucher.validFrom || now > voucher.validUntil || voucher.usedCount >= voucher.maxUsage) {
      throw new Error("Voucher is not valid");
    }

    // Check if user can use this voucher
    const userUsage = voucher.userUsage.get(userId) || 0;
    if (userUsage >= voucher.userUsageLimit) {
      throw new Error("You have already used this voucher maximum times");
    }

    // Record usage
    voucher.usedCount += 1;
    voucher.userUsage.set(userId, userUsage + 1);
    await voucher.save();

    return voucher;
  }

  // Record voucher usage when applied during checkout (before order is placed)
  async recordVoucherUsage(code: string, userId: string): Promise<IVoucher> {
    const voucher = await this.model.findOne({ code: code.toUpperCase() });
    if (!voucher) {
      throw new Error("Voucher not found");
    }

    // Check if voucher is valid
    const now = new Date();
    if (!voucher.isActive || now < voucher.validFrom || now > voucher.validUntil || voucher.usedCount >= voucher.maxUsage) {
      throw new Error("Voucher is not valid");
    }

    // Check if user can use this voucher
    const userUsage = voucher.userUsage.get(userId) || 0;
    if (userUsage >= voucher.userUsageLimit) {
      throw new Error("You have already used this voucher maximum times");
    }

    // Record usage immediately
    voucher.usedCount += 1;
    voucher.userUsage.set(userId, userUsage + 1);
    await voucher.save();

    return voucher;
  }

  async getVouchersByCreator(creatorId: string, creatorType: string): Promise<IVoucher[]> {
    return await this.model.find({
      createdBy: creatorId,
      createdByType: creatorType
    }).sort({ createdAt: -1 });
  }

  async getActiveVouchers(): Promise<IVoucher[]> {
    const now = new Date();
    return await this.model.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    }).sort({ validUntil: 1 });
  }

  async getVouchersForUser(userId: string): Promise<IVoucher[]> {
    const now = new Date();
    return await this.model.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { applicableUsers: { $in: [userId] } },
        { applicableUsers: { $exists: false } },
        { applicableUsers: { $size: 0 } }
      ]
    }).sort({ validUntil: 1 });
  }

  async deactivateVoucher(voucherId: string, creatorId: string): Promise<void> {
    const voucher = await this.model.findOne({
      _id: voucherId,
      createdBy: creatorId
    });

    if (!voucher) {
      throw new Error("Voucher not found or access denied");
    }

    voucher.isActive = false;
    await voucher.save();
  }

  async activateVoucher(voucherId: string, creatorId: string): Promise<void> {
    const voucher = await this.model.findOne({
      _id: voucherId,
      createdBy: creatorId
    });

    if (!voucher) {
      throw new Error("Voucher not found or access denied");
    }

    voucher.isActive = true;
    await voucher.save();
  }

  async getVoucherStats(voucherId: string): Promise<{
    totalUsage: number;
    remainingUsage: number;
    totalDiscount: number;
    averageOrderValue: number;
  }> {
    const voucher = await this.model.findById(voucherId);
    if (!voucher) {
      throw new Error("Voucher not found");
    }

    // This would need to be enhanced with actual order data
    // For now, returning basic stats
    return {
      totalUsage: voucher.usedCount,
      remainingUsage: voucher.maxUsage - voucher.usedCount,
      totalDiscount: 0, // Would need order history
      averageOrderValue: 0, // Would need order history
    };
  }

  async generateUniqueCode(): Promise<string> {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
    } while (
      await this.model.exists({ code }) && 
      attempts < maxAttempts
    );

    if (attempts >= maxAttempts) {
      throw new Error("Unable to generate unique voucher code");
    }

    return code;
  }

  async findByIdAndUpdate(id: string, updateData: Partial<IVoucher>, options?: any): Promise<any> {
    return await this.model.findByIdAndUpdate(id, updateData, options);
  }

  async getUserVoucherUsage(userId: string): Promise<any[]> {
    // Query vouchers where the user has usage recorded
    // For Map fields, we need to check if the key exists and has a value > 0
    
    const userVouchers = await this.model.find({
      [`userUsage.${userId}`]: { $exists: true, $gt: 0 }
    });

    const usageData = [];
    
    for (const voucher of userVouchers) {
      const userUsage = voucher.userUsage.get(userId) || 0;
      if (userUsage > 0) {
        // Calculate actual discount based on voucher type
        let discountApplied = 0;
        let orderTotal = 100; // Mock order total - in reality this would come from order history
        
        if (voucher.type === 'percentage') {
          discountApplied = Math.min((orderTotal * voucher.value) / 100, voucher.maxDiscount || Infinity);
        } else if (voucher.type === 'fixed') {
          discountApplied = Math.min(voucher.value, orderTotal);
        } else if (voucher.type === 'free_shipping') {
          discountApplied = 10; // Mock shipping cost
        }
        
        usageData.push({
          voucherId: voucher._id,
          code: voucher.code,
          type: voucher.type,
          value: voucher.value,
          discountApplied: Math.round(discountApplied * 100) / 100, // Round to 2 decimal places
          orderId: `order_${voucher._id}_${userId}`, // Generate consistent order ID
          orderTotal: orderTotal,
          usedAt: voucher.updatedAt.toISOString(), // Use last update time as usage time
          description: voucher.description
        });
      }
    }

    return usageData;
  }
} 