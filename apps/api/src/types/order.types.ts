// // src/types/order.types.ts
// import { Document } from "mongoose";

// export type OrderStatus =
//   | "pending"
//   | "processing"
//   | "shipped"
//   | "delivered"
//   | "cancelled"
//   | "disputed";

// export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// export type ShippingStatus =
//   | "pending"
//   | "processing"
//   | "shipped"
//   | "delivered"
//   | "returned";

// export interface IOrderBase {
//   buyer: string;
//   seller: string;
//   product: string;
//   quantity: number;
//   totalPrice: number;
//   currency: string;
//   status: OrderStatus;
//   paymentStatus: PaymentStatus;
//   paymentMethod?: string;
//   transactionHash?: string;
//   shippingDetails: {
//     address: string;
//     city: string;
//     country: string;
//     postalCode?: string;
//     contactNumber: string;
//   };
//   shippingStatus: ShippingStatus;
//   trackingNumber?: string;
//   carrier?: string;
//   estimatedDelivery?: Date;
//   notes?: string;
//   metadata?: Record<string, any>;
// }

// export interface IOrderMethods {
//   calculateTotal(): number;
//   canBeCancelled(): boolean;
//   generateInvoice(): Promise<Buffer>;
// }

// export interface IOrder extends IOrderBase, Document, IOrderMethods {}

// export interface IDispute extends Document {
//   order: string;
//   initiator: string;
//   reason: string;
//   description: string;
//   status: "open" | "resolved" | "closed";
//   resolution?: string;
//   evidence?: {
//     description: string;
//     files: string[];
//     submittedBy: string;
//     submittedAt: Date;
//   }[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface IPayment extends Document {
//   order: string;
//   amount: number;
//   currency: string;
//   method: string;
//   status: PaymentStatus;
//   transactionId?: string;
//   paymentProvider?: string;
//   metadata?: Record<string, any>;
//   createdAt: Date;
//   processedAt?: Date;
// }

// export interface OrderAnalytics {
//   totalOrders: number;
//   totalRevenue: number;
//   averageOrderValue: number;
//   statusBreakdown: Record<OrderStatus, number>;
//   revenueByPeriod: {
//     period: string;
//     revenue: number;
//     orderCount: number;
//   }[];
//   topProducts: {
//     productId: string;
//     name: string;
//     quantity: number;
//     revenue: number;
//   }[];
//   paymentMethodBreakdown: Record<string, number>;
// }
