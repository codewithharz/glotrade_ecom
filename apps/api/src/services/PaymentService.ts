// src/services/PaymentService.ts
import { Payment } from "../models";
import { AppError, ValidationError } from "../utils/errors";
import { NotificationService } from "./NotificationService";

export type PaymentProviderName = "paystack" | "flutterwave";

export interface InitPaymentArgs {
  orderId: string;
  provider: PaymentProviderName;
  amount: number; // kobo
  currency: string; // NGN
  customer: { email: string; name?: string };
  returnUrl: string;
  metadata?: any;
}

export interface InitPaymentResult {
  url: string;
  reference: string;
}

export interface IPaymentProvider {
  initialize(args: InitPaymentArgs): Promise<InitPaymentResult>;
  verify(reference: string): Promise<{ paid: boolean; amount: number; currency: string }>;
}

export class PaymentService {
  constructor(private providers: Record<PaymentProviderName, IPaymentProvider>) { }

  async initialize(args: InitPaymentArgs): Promise<InitPaymentResult> {
    if (!args.amount || args.amount <= 0) {
      throw new ValidationError("Amount must be greater than 0");
    }
    const provider = this.providers[args.provider];
    if (!provider) throw new Error(`Provider ${args.provider} not configured`);
    let res: InitPaymentResult;
    try {
      res = await provider.initialize(args);
    } catch (e: any) {
      // Surface provider error details to client as 400 instead of generic 500
      const message = e?.message || "Failed to initialize payment";
      throw new AppError(message, 400);
    }
    await Payment.create({
      orderId: args.orderId,
      provider: args.provider,
      reference: res.reference,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      metadata: args.metadata,
    });
    return res;
  }

  async verify(providerName: PaymentProviderName, reference: string) {
    const provider = this.providers[providerName];
    if (!provider) throw new Error(`Provider ${providerName} not configured`);
    const result = await provider.verify(reference);
    let payment = await Payment.findOne({ reference });
    if (!payment) {
      // Create a record if it does not exist to prevent verification failures
      payment = await Payment.create({
        provider: providerName,
        reference,
        amount: result.amount,
        currency: result.currency,
        status: result.paid ? "paid" : "failed",
        settled: false,
      } as any);
    } else {
      payment.status = result.paid ? "paid" : "failed";
      payment.amount = typeof result.amount === "number" ? result.amount : payment.amount;
      payment.currency = result.currency || payment.currency;
      await payment.save();
    }

    // Create payment notification
    try {
      const notificationService = new NotificationService();

      // Get user ID from the order if payment has orderId
      let userId = '';
      if (payment.orderId) {
        try {
          // Check if orderId is a valid ObjectId (for actual orders) or a wallet topup string
          if (typeof payment.orderId === 'string' && payment.orderId.startsWith('WALLET_TOPUP_')) {
            // For wallet topups, extract userId from the orderId string
            const parts = payment.orderId.split('_');
            if (parts.length >= 3) {
              userId = parts[2]; // userId is the third part after WALLET_TOPUP_
            }
          } else {
            // For actual orders, look up the order
            const { Order } = require('../models');
            const order = await Order.findById(payment.orderId).select('buyer').lean();
            if (order?.buyer) {
              userId = order.buyer.toString();
            }
          }
        } catch (orderError) {
          console.error('Failed to get order for payment notification:', orderError);
        }
      }

      // Fallback to metadata if order lookup fails
      if (!userId) {
        userId = payment.metadata?.userId || payment.metadata?.buyerId || '';
      }

      if (result.paid) {
        await notificationService.createPaymentNotification('payment_confirmed', {
          paymentId: (payment._id as any).toString(),
          orderId: (payment.orderId as any)?.toString() || '',
          amount: payment.currency === 'NGN' ? payment.amount / 100 : payment.amount,
          currency: payment.currency,
          method: payment.provider,
          status: 'completed',
          transactionId: payment.reference,
          userId: userId
        });
      } else {
        await notificationService.createPaymentNotification('payment_failed', {
          paymentId: (payment._id as any).toString(),
          orderId: (payment.orderId as any)?.toString() || '',
          amount: payment.currency === 'NGN' ? payment.amount / 100 : payment.amount,
          currency: payment.currency,
          method: payment.provider,
          status: 'failed',
          transactionId: payment.reference,
          userId: userId
        });
      }
    } catch (error) {
      console.error('Failed to create payment notification:', error);
    }

    return { ok: result.paid };
  }
}

// import { TokenService } from "./TokenService";
// import { NotificationService } from "./NotificationService";
// import { ValidationError } from "../utils/errors";

// type PaymentMethod = "token" | "crypto" | "bank_transfer" | "mobile_money";
// type PaymentStatus =
//   | "pending"
//   | "processing"
//   | "completed"
//   | "failed"
//   | "refunded";

// interface PaymentProcessor {
//   processPayment(
//     amount: number,
//     currency: string,
//     metadata: any
//   ): Promise<PaymentResult>;
//   verifyPayment(paymentId: string): Promise<boolean>;
//   refundPayment(paymentId: string, amount: number): Promise<boolean>;
// }

// interface PaymentResult {
//   success: boolean;
//   transactionId?: string;
//   status: PaymentStatus;
//   message?: string;
//   metadata?: any;
// }

// export class PaymentService {
//   private processors: Map<PaymentMethod, PaymentProcessor>;

//   constructor(
//     private tokenService: TokenService,
//     private notificationService: NotificationService
//   ) {
//     this.processors = new Map();
//     this.initializeProcessors();
//   }

//   async processPayment(
//     method: PaymentMethod,
//     amount: number,
//     currency: string,
//     metadata: any
//   ): Promise<PaymentResult> {
//     const processor = this.processors.get(method);
//     if (!processor) {
//       throw new ValidationError(`Payment method ${method} not supported`);
//     }

//     try {
//       // Pre-payment validation
//       await this.validatePayment(method, amount, currency, metadata);

//       // Process payment
//       const result = await processor.processPayment(amount, currency, metadata);

//       // Post-payment processing
//       if (result.success) {
//         await this.handleSuccessfulPayment(result, metadata);
//       } else {
//         await this.handleFailedPayment(result, metadata);
//       }

//       return result;
//     } catch (error) {
//       await this.handlePaymentError(error, metadata);
//       throw error;
//     }
//   }

//   async refundPayment(
//     paymentId: string,
//     amount: number,
//     method: PaymentMethod,
//     reason: string
//   ): Promise<PaymentResult> {
//     const processor = this.processors.get(method);
//     if (!processor) {
//       throw new ValidationError(`Payment method ${method} not supported`);
//     }

//     const refundResult = await processor.refundPayment(paymentId, amount);

//     if (refundResult) {
//       await this.notificationService.sendNotification("payment_refunded", {
//         data: {
//           paymentId,
//           amount,
//           reason,
//           timestamp: new Date(),
//         },
//       });
//     }

//     return {
//       success: refundResult,
//       status: refundResult ? "refunded" : "failed",
//       message: refundResult ? "Refund processed successfully" : "Refund failed",
//     };
//   }

//   private async validatePayment(
//     method: PaymentMethod,
//     amount: number,
//     currency: string,
//     metadata: any
//   ): Promise<void> {
//     if (amount <= 0) {
//       throw new ValidationError("Invalid payment amount");
//     }

//     if (method === "token") {
//       const balance = await this.tokenService.getTokenBalance(
//         metadata.buyerAddress
//       );
//       if (balance.available < amount) {
//         throw new ValidationError("Insufficient token balance");
//       }
//     }
//   }

//   private async handleSuccessfulPayment(
//     result: PaymentResult,
//     metadata: any
//   ): Promise<void> {
//     await this.notificationService.sendNotification("payment_received", {
//       userId: metadata.buyerId,
//       data: {
//         amount: metadata.amount,
//         orderId: metadata.orderId,
//         transactionId: result.transactionId,
//       },
//     });
//   }

//   private async handleFailedPayment(
//     result: PaymentResult,
//     metadata: any
//   ): Promise<void> {
//     await this.notificationService.sendNotification("payment_failed", {
//       userId: metadata.buyerId,
//       data: {
//         amount: metadata.amount,
//         orderId: metadata.orderId,
//         reason: result.message,
//       },
//     });
//   }

//   private async handlePaymentError(error: any, metadata: any): Promise<void> {
//     await this.notificationService.sendNotification("payment_error", {
//       type: "system",
//       data: {
//         error: error.message,
//         metadata,
//       },
//     });
//   }

//   private initializeProcessors(): void {
//     // Token payment processor
//     this.processors.set("token", {
//       processPayment: async (amount, currency, metadata) => {
//         const result = await this.tokenService.delegate(
//           metadata.buyerAddress,
//           metadata.sellerAddress,
//           amount
//         );
//         return {
//           success: true,
//           transactionId: `token_${Date.now()}`,
//           status: "completed",
//           metadata: result,
//         };
//       },
//       verifyPayment: async (paymentId) => true,
//       refundPayment: async (paymentId, amount) => true,
//     });

//     // Add more payment processors here
//   }
// }
