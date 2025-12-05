// apps/api/src/services/VirtualWalletService.ts
import { IUser } from "../types/user.types";
import User from "../models/User";
import Wallet from "../models/Wallet";
import WalletTransaction from "../models/WalletTransaction";
import { PaystackProvider } from "./providers/PaystackProvider";
import { FlutterwaveProvider } from "./providers/FlutterwaveProvider";

export interface BankAccount {
  accountNumber: string;
  bankCode: string;
  accountName: string;
  bankName: string;
}

export interface VirtualTransaction {
  fromUserId: string;
  toUserId?: string;
  amount: number;
  currency: "NGN" | "ATH";
  type: "deposit" | "withdrawal" | "transfer" | "payout";
  description?: string;
  reference?: string;
}

export interface KYCLevel {
  level: 1 | 2 | 3;
  dailyLimit: number;
  monthlyLimit: number;
  requirements: string[];
}

export class VirtualWalletService {
  private paystack: PaystackProvider;
  private flutterwave: FlutterwaveProvider;

  // KYC Level limits (in kobo for NGN)
  private readonly KYC_LIMITS: Record<number, KYCLevel> = {
    1: {
      level: 1,
      dailyLimit: 5000000,    // ₦50,000
      monthlyLimit: 50000000, // ₦500,000
      requirements: ["email", "phone"]
    },
    2: {
      level: 2,
      dailyLimit: 20000000,   // ₦200,000
      monthlyLimit: 200000000, // ₦2,000,000
      requirements: ["email", "phone", "idCard", "utilityBill"]
    },
    3: {
      level: 3,
      dailyLimit: 100000000,  // ₦1,000,000
      monthlyLimit: 1000000000, // ₦10,000,000
      requirements: ["email", "phone", "idCard", "utilityBill", "bankStatement", "businessRegistration"]
    }
  };

  constructor() {
    try {
      this.paystack = new PaystackProvider();
      this.flutterwave = new FlutterwaveProvider();
    } catch (error) {
      console.error("Failed to initialize payment providers:", error);
      // Set to null to handle gracefully
      this.paystack = null as any;
      this.flutterwave = null as any;
    }
  }

  /**
   * Process virtual transfer between users (no actual money movement)
   */
  async processVirtualTransfer(transaction: VirtualTransaction): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const { fromUserId, toUserId, amount, currency, type, description, reference } = transaction;

      // Validate transaction limits
      const limitCheck = await this.validateTransactionLimit(fromUserId, amount, "daily");
      if (!limitCheck.valid) {
        return { success: false, error: limitCheck.error };
      }

      // Get sender's wallet
      const senderWallet = await this.getUserWallet(fromUserId, currency);
      if (!senderWallet) {
        return { success: false, error: "Sender wallet not found" };
      }

      // Check sufficient balance
      if (senderWallet.balance < amount) {
        return { success: false, error: "Insufficient balance" };
      }

      // For transfers, validate recipient
      if (type === "transfer" && toUserId) {
        const recipientWallet = await this.getUserWallet(toUserId, currency);
        if (!recipientWallet) {
          return { success: false, error: "Recipient wallet not found" };
        }

        // Process virtual transfer
        await this.executeVirtualTransfer(senderWallet, recipientWallet, amount, description, reference);
      } else if (type === "withdrawal" || type === "payout") {
        // For withdrawals, debit virtual balance (actual money movement handled by payment gateway)
        await this.debitVirtualBalance(senderWallet, amount, description, reference);
      }

      return { success: true, transactionId: reference };
    } catch (error) {
      console.error("Virtual transfer error:", error);
      return { success: false, error: "Transfer failed" };
    }
  }

  /**
   * Process deposit via payment gateway
   */
  async processDeposit(userId: string, amount: number, currency: "NGN" | "ATH", gateway: "paystack" | "flutterwave"): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Validate transaction limits
      const limitCheck = await this.validateTransactionLimit(userId, amount, "daily");
      if (!limitCheck.valid) {
        return { success: false, error: limitCheck.error };
      }

      // Create payment gateway transaction
      let paymentResult;
      const reference = `deposit_${Date.now()}_${userId}`;
      if (gateway === "paystack" && this.paystack) {
        paymentResult = await this.paystack.initialize({
          amount: amount,
          currency: currency,
          customer: { email: user.email, name: user.displayName || user.username },
          returnUrl: `${process.env.FRONTEND_URL || 'https://afritrade-hub-web.vercel.app'}/profile/wallet`,
          orderId: reference,
          provider: "paystack",
          metadata: { type: 'wallet_deposit', userId }
        });
      } else if (gateway === "flutterwave" && this.flutterwave) {
        paymentResult = await this.flutterwave.initialize({
          amount: amount,
          currency: currency,
          customer: { email: user.email, name: user.displayName || user.username },
          returnUrl: `${process.env.FRONTEND_URL || 'https://afritrade-hub-web.vercel.app'}/profile/wallet`,
          orderId: reference,
          provider: "flutterwave",
          metadata: { type: 'wallet_deposit', userId }
        });
      } else {
        return { success: false, error: "Payment gateway not available" };
      }

      if (paymentResult.url) {
        // Store pending transaction
        await this.createPendingTransaction(userId, amount, currency, "deposit", reference);
        return { success: true, paymentUrl: paymentResult.url };
      } else {
        return { success: false, error: "Payment initialization failed" };
      }
    } catch (error) {
      console.error("Deposit error:", error);
      return { success: false, error: "Deposit failed" };
    }
  }

  /**
   * Process withdrawal/payout via payment gateway
   */
  async processWithdrawal(userId: string, amount: number, bankAccount: BankAccount, gateway: "paystack" | "flutterwave"): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Validate transaction limits
      const limitCheck = await this.validateTransactionLimit(userId, amount, "daily");
      if (!limitCheck.valid) {
        return { success: false, error: limitCheck.error };
      }

      // Get user's wallet
      const wallet = await this.getUserWallet(userId, "NGN"); // Withdrawals typically in NGN
      if (!wallet || wallet.balance < amount) {
        return { success: false, error: "Insufficient balance" };
      }

      // Process payout via payment gateway
      let payoutResult;
      const reference = `withdrawal_${Date.now()}_${userId}`;
      if (gateway === "paystack" && this.paystack) {
        // First create recipient, then transfer
        const recipientResult = await this.paystack.createRecipient({
          name: bankAccount.accountName,
          accountNumber: bankAccount.accountNumber,
          bankCode: bankAccount.bankCode
        });
        
        payoutResult = await this.paystack.transfer({
          recipientCode: recipientResult.recipientCode,
          amount: amount,
          reason: `Wallet withdrawal for ${bankAccount.accountName}`
        });
      } else if (gateway === "flutterwave" && this.flutterwave) {
        // Flutterwave doesn't have direct transfer in this implementation
        // We'll need to implement it or use a different approach
        return { success: false, error: "Flutterwave transfers not implemented yet" };
      } else {
        return { success: false, error: "Payment gateway not available" };
      }

      if (payoutResult.transferId) {
        // Debit virtual balance
        await this.debitVirtualBalance(wallet, amount, "Withdrawal to bank account", reference);
        return { success: true, transactionId: payoutResult.transferId };
      } else {
        return { success: false, error: "Withdrawal failed" };
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      return { success: false, error: "Withdrawal failed" };
    }
  }

  /**
   * Validate transaction limits based on KYC level
   */
  async validateTransactionLimit(userId: string, amount: number, type: "daily" | "monthly"): Promise<{ valid: boolean; error?: string }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { valid: false, error: "User not found" };
      }

      const kycLevel = user.kycLevel || 1;
      const limits = this.KYC_LIMITS[kycLevel];
      
      if (!limits) {
        return { valid: false, error: "Invalid KYC level" };
      }

      const limit = type === "daily" ? limits.dailyLimit : limits.monthlyLimit;
      
      if (amount > limit) {
        const limitAmount = (limit / 100).toLocaleString(); // Convert from kobo to naira
        return { 
          valid: false, 
          error: `Transaction amount exceeds ${type} limit of ₦${limitAmount} for KYC level ${kycLevel}` 
        };
      }

      return { valid: true };
    } catch (error) {
      console.error("Limit validation error:", error);
      return { valid: false, error: "Unable to validate transaction limits" };
    }
  }

  /**
   * Get user's wallet for specific currency
   */
  private async getUserWallet(userId: string, currency: "NGN" | "ATH"): Promise<any> {
    try {
      let wallet = await Wallet.findOne({ userId, currency });
      
      // Auto-create wallet if it doesn't exist
      if (!wallet) {
        wallet = await Wallet.create({
          userId,
          type: "user",
          currency,
          balance: 0,
          frozenBalance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          totalSpent: 0,
          totalEarned: 0,
          status: "active"
        });
      }
      
      return wallet;
    } catch (error) {
      console.error("Get wallet error:", error);
      return null;
    }
  }

  /**
   * Execute virtual transfer between wallets
   */
  private async executeVirtualTransfer(senderWallet: any, recipientWallet: any, amount: number, description?: string, reference?: string): Promise<void> {
    const session = await Wallet.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Debit sender
        senderWallet.balance -= amount;
        senderWallet.totalSpent += amount;
        await senderWallet.save({ session });

        // Credit recipient
        recipientWallet.balance += amount;
        recipientWallet.totalEarned += amount;
        await recipientWallet.save({ session });

        // Create transaction record
        await WalletTransaction.create([{
          walletId: senderWallet._id,
          userId: senderWallet.userId,
          type: "transfer",
          category: "outgoing",
          amount: -amount,
          currency: senderWallet.currency,
          balanceBefore: senderWallet.balance + amount,
          balanceAfter: senderWallet.balance,
          status: "success",
          reference: reference || `transfer_${Date.now()}`,
          description: description || "Transfer to another user",
          processedAt: new Date()
        }, {
          walletId: recipientWallet._id,
          userId: recipientWallet.userId,
          type: "transfer",
          category: "incoming",
          amount: amount,
          currency: recipientWallet.currency,
          balanceBefore: recipientWallet.balance - amount,
          balanceAfter: recipientWallet.balance,
          status: "success",
          reference: reference || `transfer_${Date.now()}`,
          description: description || "Transfer from another user",
          processedAt: new Date()
        }], { session });
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Debit virtual balance
   */
  private async debitVirtualBalance(wallet: any, amount: number, description?: string, reference?: string): Promise<void> {
    wallet.balance -= amount;
    wallet.totalSpent += amount;
    await wallet.save();

    // Create transaction record
    await WalletTransaction.create({
      walletId: wallet._id,
      userId: wallet.userId,
      type: "withdrawal",
      category: "outgoing",
      amount: -amount,
      currency: wallet.currency,
      balanceBefore: wallet.balance + amount,
      balanceAfter: wallet.balance,
      status: "success",
      reference: reference || `withdrawal_${Date.now()}`,
      description: description || "Withdrawal",
      processedAt: new Date()
    });
  }

  /**
   * Create pending transaction record
   */
  private async createPendingTransaction(userId: string, amount: number, currency: "NGN" | "ATH", type: string, reference: string): Promise<void> {
    const wallet = await this.getUserWallet(userId, currency);
    if (wallet) {
      await WalletTransaction.create({
        walletId: wallet._id,
        userId,
        type: type as any,
        category: "incoming",
        amount,
        currency,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
        status: "pending",
        reference,
        description: `Pending ${type}`,
        processedAt: null
      });
    }
  }

  /**
   * Verify payment gateway transaction
   */
  async verifyPayment(reference: string, gateway: "paystack" | "flutterwave"): Promise<{ success: boolean; error?: string }> {
    try {
      let verificationResult;
      
      if (gateway === "paystack" && this.paystack) {
        verificationResult = await this.paystack.verify(reference);
      } else if (gateway === "flutterwave" && this.flutterwave) {
        verificationResult = await this.flutterwave.verify(reference);
      } else {
        return { success: false, error: "Payment gateway not available" };
      }

      if (verificationResult.paid) {
        // Update virtual balance
        const transaction = await WalletTransaction.findOne({ reference });
        if (transaction) {
          const wallet = await Wallet.findById(transaction.walletId);
          if (wallet) {
            wallet.balance += transaction.amount;
            wallet.totalDeposited += transaction.amount;
            await wallet.save();

            // Update transaction status
            transaction.status = "completed";
            transaction.balanceAfter = wallet.balance;
            transaction.processedAt = new Date();
            await transaction.save();
          }
        }
        return { success: true };
      } else {
        return { success: false, error: "Payment not verified" };
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      return { success: false, error: "Payment verification failed" };
    }
  }
}

export default VirtualWalletService;
