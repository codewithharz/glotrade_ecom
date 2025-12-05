import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { WalletService } from "../services/WalletService";
import { BaseController } from "./BaseController";
import { IWallet } from "../models/Wallet";
import { AuthRequest } from "../types/custom";

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  // Get wallet summary
  getWalletSummary = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.query.userId;

      if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
      }

      const type = req.query.type || "user";
      const summary = await this.walletService.getWalletSummary(userId, type);

      res.status(200).json({
        status: "success",
        data: summary,
      });
    } catch (error) {
      console.error(`[WalletController] Error in getWalletSummary:`, error);
      next(error);
    }
  };

  // Get wallet balance
  getWalletBalance = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { currency, type } = req.query;

      if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
      }

      if (!currency || currency !== "NGN") {
        return res.status(400).json({
          status: "error",
          message: "Currency must be NGN (Naira)"
        });
      }

      const balance = await this.walletService.getWalletBalance(
        userId,
        currency,
        type || "user"
      );

      res.status(200).json({
        status: "success",
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get transaction history with enhanced search and filtering
  getTransactionHistory = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.query.userId;
      const {
        currency,
        type,
        transactionType,
        status,
        search,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        sortBy,
        sortOrder,
        limit = 20,
        page = 1
      } = req.query;

      if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
      }

      // Parse date filters
      const filters: any = {};
      if (currency) filters.currency = currency;
      if (type) filters.type = type;
      if (transactionType) filters.transactionType = transactionType;
      if (status) filters.status = status;
      if (search) filters.search = search;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (minAmount) filters.minAmount = parseFloat(minAmount as string);
      if (maxAmount) filters.maxAmount = parseFloat(maxAmount as string);
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;

      const history = await this.walletService.getTransactionHistory(
        userId,
        filters,
        parseInt(limit as string),
        parseInt(page as string)
      );

      res.status(200).json({
        status: "success",
        data: history,
      });
    } catch (error) {
      next(error);
    }
  };

  // Top up wallet
  topUpWallet = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { amount, currency, provider, returnUrl } = req.body;

      if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
      }

      if (!amount || !currency || !provider) {
        return res.status(400).json({
          status: "error",
          message: "Amount, currency, and provider are required"
        });
      }

      if (!["NGN"].includes(currency)) {
        return res.status(400).json({
          status: "error",
          message: "Only NGN top-ups are supported"
        });
      }

      if (!["paystack", "flutterwave"].includes(provider)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid payment provider"
        });
      }

      const result = await this.walletService.topUpWallet({
        userId,
        amount: parseInt(amount),
        currency,
        provider,
        returnUrl,
      });

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify top-up payment
  verifyTopUp = async (req: any, res: Response, next: NextFunction) => {
    try {
      const { reference, provider } = req.query;

      if (!reference || !provider) {
        return res.status(400).json({
          status: "error",
          message: "Reference and provider are required"
        });
      }

      if (!["paystack", "flutterwave"].includes(provider)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid payment provider"
        });
      }

      const transaction = await this.walletService.processTopUpVerification(
        reference,
        provider
      );

      res.status(200).json({
        status: "success",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  // DEPRECATED: P2P transfers disabled for wholesaler platform
  // Transfer funds to another user
  transferFunds = async (req: any, res: Response, next: NextFunction) => {
    return res.status(403).json({
      status: "error",
      message: "P2P transfers are disabled for wholesaler platform"
    });
  };

  // DEPRECATED: P2P transfers disabled for wholesaler platform
  // Validate transfer before execution
  validateTransfer = async (req: any, res: Response, next: NextFunction) => {
    return res.status(403).json({
      status: "error",
      message: "P2P transfers are disabled for wholesaler platform"
    });
  };

  // Create user wallets (for new users)
  createUserWallets = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
      }

      const wallets = await this.walletService.createUserWallets(userId);

      res.status(201).json({
        status: "success",
        data: wallets,
      });
    } catch (error) {
      next(error);
    }
  };

  // Create vendor wallets
  createVendorWallets = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
      }

      const wallets = await this.walletService.createVendorWallets(userId);

      res.status(201).json({
        status: "success",
        data: wallets,
      });
    } catch (error) {
      next(error);
    }
  };

  // Freeze funds (admin only)
  freezeFunds = async (req: any, res: Response, next: NextFunction) => {
    try {
      const { userId, amount, currency, type, reason } = req.body;

      if (!userId || !amount || !currency || !reason) {
        return res.status(400).json({
          status: "error",
          message: "User ID, amount, currency, and reason are required"
        });
      }

      await this.walletService.freezeFunds(
        userId,
        parseInt(amount),
        currency,
        type || "user",
        reason
      );

      res.status(200).json({
        status: "success",
        message: "Funds frozen successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // Unfreeze funds (admin only)
  unfreezeFunds = async (req: any, res: Response, next: NextFunction) => {
    try {
      const { userId, amount, currency, type, reason } = req.body;

      if (!userId || !amount || !currency || !reason) {
        return res.status(400).json({
          status: "error",
          message: "User ID, amount, currency, and reason are required"
        });
      }

      await this.walletService.unfreezeFunds(
        userId,
        parseInt(amount),
        currency,
        type || "user",
        reason
      );

      res.status(200).json({
        status: "success",
        message: "Funds unfrozen successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // Search users for transfers
  searchUsers = async (req: any, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json({
          status: "error",
          message: "Search query must be at least 2 characters"
        });
      }

      const User = require("../models/User").default;

      // Search users by wallet ID, username, email, or display name
      const users = await User.find({
        $and: [
          {
            $or: [
              { isWalletPublic: true },
              { isWalletPublic: { $exists: false } } // Include users where isWalletPublic doesn't exist (default to true)
            ]
          },
          { isDeleted: { $ne: true } }, // Exclude deleted users
          {
            $or: [
              { walletId: { $regex: q, $options: 'i' } },
              { username: { $regex: q, $options: 'i' } },
              { email: { $regex: q, $options: 'i' } },
              { displayName: { $regex: q, $options: 'i' } }
            ]
          }
        ]
      })
        .select('walletId displayName username email profileImage isVerified kycStatus kycLevel')
        .limit(10)
        .lean();

      // Format response
      const formattedUsers = users.map(user => ({
        _id: user._id,
        walletId: user.walletId,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        kycLevel: user.kycLevel
      }));

      res.status(200).json({
        status: "success",
        data: formattedUsers
      });
    } catch (error) {
      console.error("User search error:", error);
      next(error);
    }
  };

  // Get user's wallet ID and display info
  getWalletInfo = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.query.userId;

      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized"
        });
      }

      const User = require("../models/User").default;
      const user = await User.findById(userId)
        .select('walletId displayName username email profileImage isVerified kycStatus kycLevel isWalletPublic walletVisibility');

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found"
        });
      }

      res.status(200).json({
        status: "success",
        data: {
          walletId: user.walletId,
          displayName: user.displayName,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
          kycStatus: user.kycStatus,
          kycLevel: user.kycLevel,
          isWalletPublic: user.isWalletPublic,
          walletVisibility: user.walletVisibility
        }
      });
    } catch (error) {
      console.error("Get wallet info error:", error);
      next(error);
    }
  };

  // Get vendor earnings analytics
  getVendorEarnings = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.query.userId;

      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized"
        });
      }

      // Get vendor wallets
      const Wallet = require("../models/Wallet").default;
      const wallets = await Wallet.find({ userId, type: "vendor" });

      if (wallets.length === 0) {
        return res.status(200).json({
          status: "success",
          data: {
            totalEarnings: 0,
            pendingPayouts: 0,
            availableBalance: 0,
            thisMonth: 0,
            lastMonth: 0,
            thisWeek: 0,
            lastWeek: 0,
            today: 0,
            yesterday: 0
          }
        });
      }

      // Calculate earnings from NGN wallet only
      const ngnWallet = wallets.find(w => w.currency === 'NGN');

      const totalEarnings = ngnWallet?.totalEarned || 0;
      const availableBalance = ngnWallet?.balance || 0;
      const pendingPayouts = ngnWallet?.frozenBalance || 0;

      // Calculate period-based earnings (mock data for now)
      const now = new Date();
      const thisMonth = Math.floor(totalEarnings * 0.8); // 80% of total earnings this month
      const lastMonth = Math.floor(totalEarnings * 0.6); // 60% last month
      const thisWeek = Math.floor(thisMonth * 0.25); // 25% of this month
      const lastWeek = Math.floor(lastMonth * 0.25); // 25% of last month
      const today = Math.floor(thisWeek * 0.2); // 20% of this week
      const yesterday = Math.floor(lastWeek * 0.2); // 20% of last week

      res.status(200).json({
        status: "success",
        data: {
          totalEarnings,
          pendingPayouts,
          availableBalance,
          thisMonth,
          lastMonth,
          thisWeek,
          lastWeek,
          today,
          yesterday
        }
      });
    } catch (error) {
      console.error("Get vendor earnings error:", error);
      next(error);
    }
  };

  // Get all wallets for admin (with user data)
  getAllWallets = async (req: any, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, status, type, currency } = req.query;

      const Wallet = require("../models/Wallet").default;
      const User = require("../models/User").default;

      // Build filter query
      const filter: any = {};
      if (status && status !== 'all') filter.status = status;
      if (type && type !== 'all') filter.type = type;
      if (currency && currency !== 'all') filter.currency = currency;

      // Get wallets with pagination
      const wallets = await Wallet.find(filter)
        .populate('userId', 'walletId displayName username email profileImage isVerified kycStatus kycLevel role lastSeen')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Get total count
      const total = await Wallet.countDocuments(filter);

      res.status(200).json({
        status: "success",
        data: {
          wallets,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        }
      });
    } catch (error) {
      console.error("Get all wallets error:", error);
      next(error);
    }
  };

  // Get wallet statistics for admin
  getWalletStats = async (req: any, res: Response, next: NextFunction) => {
    try {
      const Wallet = require("../models/Wallet").default;
      const User = require("../models/User").default;

      // Get wallet statistics
      const totalWallets = await Wallet.countDocuments();
      const activeWallets = await Wallet.countDocuments({ status: 'active' });
      const frozenWallets = await Wallet.countDocuments({ status: 'frozen' });

      // Calculate total balance
      const wallets = await Wallet.find({ status: 'active' });
      const totalBalance = wallets.reduce((sum, wallet) => {
        return sum + wallet.balance; // All balances are in kobo (NGN)
      }, 0);

      // Get user counts
      const totalUsers = await User.countDocuments({ role: 'buyer' });
      const totalVendors = await User.countDocuments({ role: 'seller' });

      res.status(200).json({
        status: "success",
        data: {
          totalWallets,
          activeWallets,
          frozenWallets,
          totalBalance,
          totalTransactions: 0, // TODO: Calculate from transaction history
          totalUsers,
          totalVendors
        }
      });
    } catch (error) {
      console.error("Get wallet stats error:", error);
      next(error);
    }
  };

  // Get user's contacts
  getContacts = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.query.userId;
      const { search, favorite, sortBy = 'lastTransferred' } = req.query;

      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized"
        });
      }

      const Contact = require("../models/Contact").default;

      // Build filter query
      const filter: any = { userId: new mongoose.Types.ObjectId(userId) };

      if (favorite === 'true') {
        filter.isFavorite = true;
      }

      if (search) {
        filter.$or = [
          { contactDisplayName: { $regex: search, $options: 'i' } },
          { contactUsername: { $regex: search, $options: 'i' } },
          { contactWalletId: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort query
      let sort: any = {};
      switch (sortBy) {
        case 'name':
          sort.contactDisplayName = 1;
          break;
        case 'lastTransferred':
          sort.lastTransferred = -1;
          break;
        case 'totalTransferred':
          sort.totalTransferred = -1;
          break;
        case 'transferCount':
          sort.transferCount = -1;
          break;
        default:
          sort.lastTransferred = -1;
      }

      const contacts = await Contact.find(filter)
        .sort(sort)
        .limit(50)
        .lean();

      res.status(200).json({
        status: "success",
        data: contacts
      });
    } catch (error) {
      console.error("Get contacts error:", error);
      next(error);
    }
  };

  // Add contact
  addContact = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { contactUserId, notes, tags } = req.body;

      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized"
        });
      }

      if (!contactUserId) {
        return res.status(400).json({
          status: "error",
          message: "Contact user ID is required"
        });
      }

      const Contact = require("../models/Contact").default;
      const User = require("../models/User").default;

      // Get contact user details
      const contactUser = await User.findById(contactUserId)
        .select('walletId displayName username email profileImage isVerified');

      if (!contactUser) {
        return res.status(404).json({
          status: "error",
          message: "Contact user not found"
        });
      }

      // Check if contact already exists
      const existingContact = await Contact.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        contactUserId: new mongoose.Types.ObjectId(contactUserId)
      });

      if (existingContact) {
        return res.status(400).json({
          status: "error",
          message: "Contact already exists"
        });
      }

      // Create new contact
      const contact = await Contact.create({
        userId: new mongoose.Types.ObjectId(userId),
        contactUserId: new mongoose.Types.ObjectId(contactUserId),
        contactWalletId: contactUser.walletId,
        contactDisplayName: contactUser.displayName || contactUser.username,
        contactUsername: contactUser.username,
        contactEmail: contactUser.email,
        contactProfileImage: contactUser.profileImage,
        isVerified: contactUser.isVerified,
        notes: notes || '',
        tags: tags || []
      });

      res.status(201).json({
        status: "success",
        data: contact
      });
    } catch (error) {
      console.error("Add contact error:", error);
      next(error);
    }
  };

  // Update contact
  updateContact = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { contactId } = req.params;
      const { isFavorite, notes, tags } = req.body;

      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized"
        });
      }

      const Contact = require("../models/Contact").default;

      const contact = await Contact.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(contactId),
          userId: new mongoose.Types.ObjectId(userId)
        },
        {
          isFavorite: isFavorite !== undefined ? isFavorite : undefined,
          notes: notes !== undefined ? notes : undefined,
          tags: tags !== undefined ? tags : undefined,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!contact) {
        return res.status(404).json({
          status: "error",
          message: "Contact not found"
        });
      }

      res.status(200).json({
        status: "success",
        data: contact
      });
    } catch (error) {
      console.error("Update contact error:", error);
      next(error);
    }
  };

  // Delete contact
  deleteContact = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { contactId } = req.params;

      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized"
        });
      }

      const Contact = require("../models/Contact").default;

      const contact = await Contact.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(contactId),
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!contact) {
        return res.status(404).json({
          status: "error",
          message: "Contact not found"
        });
      }

      res.status(200).json({
        status: "success",
        message: "Contact deleted successfully"
      });
    } catch (error) {
      console.error("Delete contact error:", error);
      next(error);
    }
  };

  // Freeze wallet (Admin only)
  freezeWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletId } = req.params;
      const { reason, adminNotes } = req.body;

      if (!walletId) {
        return res.status(400).json({
          status: "error",
          message: "Wallet ID is required"
        });
      }

      const result = await this.walletService.freezeWallet(
        walletId,
        reason || "Administrative action",
        adminNotes
      );

      res.json({
        status: "success",
        message: "Wallet frozen successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Unfreeze wallet (Admin only)
  unfreezeWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletId } = req.params;
      const { reason, adminNotes } = req.body;

      if (!walletId) {
        return res.status(400).json({
          status: "error",
          message: "Wallet ID is required"
        });
      }

      const result = await this.walletService.unfreezeWallet(
        walletId,
        reason || "Administrative action",
        adminNotes
      );

      res.json({
        status: "success",
        message: "Wallet unfrozen successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Get wallet freeze history (Admin only)
  async getWalletFreezeHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { walletId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!walletId) {
        return res.status(400).json({
          status: "error",
          message: "Wallet ID is required"
        });
      }

      const result = await this.walletService.getWalletFreezeHistory(
        walletId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        status: "success",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get comprehensive wallet details (Admin only)
  getWalletDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletId } = req.params;

      if (!walletId) {
        return res.status(400).json({
          status: "error",
          message: "Wallet ID is required"
        });
      }

      const result = await this.walletService.getWalletDetails(walletId);

      res.json({
        status: "success",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Adjust wallet balance (Admin only)
  adjustWalletBalance = async (req: any, res: Response, next: NextFunction) => {
    try {
      const { walletId } = req.params;
      const { amount, reason } = req.body;
      const adminId = req.user?.id;

      if (!walletId) {
        return res.status(400).json({
          status: "error",
          message: "Wallet ID is required"
        });
      }

      if (amount === undefined || amount === null) {
        return res.status(400).json({
          status: "error",
          message: "Amount is required"
        });
      }

      if (!reason) {
        return res.status(400).json({
          status: "error",
          message: "Reason is required"
        });
      }

      if (!adminId) {
        return res.status(401).json({
          status: "error",
          message: "Admin not authenticated"
        });
      }

      const result = await this.walletService.adjustBalance(
        walletId,
        amount,
        reason,
        adminId
      );

      res.json({
        status: "success",
        message: amount > 0 ? "Wallet credited successfully" : "Wallet debited successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Add admin note to wallet (Admin only)
  addAdminNote = async (req: any, res: Response, next: NextFunction) => {
    try {
      const { walletId } = req.params;
      const { note } = req.body;
      const adminId = req.user?.id;

      if (!walletId) {
        return res.status(400).json({
          status: "error",
          message: "Wallet ID is required"
        });
      }

      if (!note) {
        return res.status(400).json({
          status: "error",
          message: "Note is required"
        });
      }

      if (!adminId) {
        return res.status(401).json({
          status: "error",
          message: "Admin not authenticated"
        });
      }

      const result = await this.walletService.addAdminNote(
        walletId,
        note,
        adminId
      );

      res.json({
        status: "success",
        message: "Admin note added successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };


  // Pay for order using wallet
  payOrder = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated"
        });
      }

      const { orderId, amount, currency } = req.body;

      if (!orderId || !amount || !currency) {
        return res.status(400).json({
          status: "error",
          message: "orderId, amount, and currency are required"
        });
      }

      // Process wallet payment
      const result = await this.walletService.processOrderPayment(
        userId,
        orderId,
        amount,
        currency as "NGN"
      );

      res.status(200).json({
        status: "success",
        message: "Payment processed successfully",
        data: result
      });
    } catch (error) {
      console.error("Pay order error:", error);
      next(error);
    }
  };

  // Export user transactions (CSV/Excel)
  exportTransactions = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated"
        });
      }

      const {
        format = "csv",
        startDate,
        endDate,
        type,
        currency
      } = req.query;

      const result = await this.walletService.exportTransactions(
        userId,
        format as string,
        {
          startDate: startDate as string,
          endDate: endDate as string,
          type: type as string,
          currency: currency as string
        }
      );

      // Set appropriate headers for file download
      const filename = `wallet-transactions-${new Date().toISOString().split('T')[0]}.${format}`;
      const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(result);
    } catch (error) {
      next(error);
    }
  };

  // Get wallet analytics
  getWalletAnalytics = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.query.userId;
      const {
        period = '30d', // 7d, 30d, 90d, 1y
        currency = 'all', // NGN or all
        type = 'all' // user, vendor, all
      } = req.query;

      if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
      }

      const analytics = await this.walletService.getWalletAnalytics(
        userId,
        period as string,
        currency as string,
        type as string
      );

      res.status(200).json({
        status: "success",
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get spending insights
  getSpendingInsights = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.query.userId;
      const {
        period = '30d',
        currency = 'all',
        category = 'all'
      } = req.query;

      if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
      }

      const insights = await this.walletService.getSpendingInsights(
        userId,
        period as string,
        currency as string,
        category as string
      );

      res.status(200).json({
        status: "success",
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get transaction trends
  getTransactionTrends = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.query.userId;
      const {
        period = '30d',
        currency = 'all',
        granularity = 'daily' // daily, weekly, monthly
      } = req.query;

      if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
      }

      const trends = await this.walletService.getTransactionTrends(
        userId,
        period as string,
        currency as string,
        granularity as string
      );

      res.status(200).json({
        status: "success",
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  };

  // Export all transactions (Admin only)
  async exportAllTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        format = "csv",
        startDate,
        endDate,
        type,
        currency,
        userId: targetUserId
      } = req.query;

      const result = await this.walletService.exportAllTransactions(
        format as string,
        {
          startDate: startDate as string,
          endDate: endDate as string,
          type: type as string,
          currency: currency as string,
          userId: targetUserId as string
        }
      );

      // Set appropriate headers for file download
      const filename = `all-wallet-transactions-${new Date().toISOString().split('T')[0]}.${format}`;
      const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  // Set credit limit (Admin only)
  setCreditLimit = async (req: any, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { limit } = req.body;

      if (!userId || limit === undefined) {
        return res.status(400).json({
          status: "error",
          message: "User ID and limit are required"
        });
      }

      const wallet = await this.walletService.setCreditLimit(userId, Number(limit));

      res.status(200).json({
        status: "success",
        data: wallet,
        message: "Credit limit updated successfully"
      });
    } catch (error) {
      next(error);
    }
  };
}
