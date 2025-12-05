// // src/services/OrderService.ts
// import { BaseService } from "./BaseService";
// import { Order, Payment, Dispute } from "../models";
// import { TokenService } from "./TokenService";
// import { MarketService } from "./MarketService";
// import {
//   IOrder,
//   OrderStatus,
//   PaymentStatus,
//   IDispute,
//   OrderAnalytics,
// } from "../types/order.types";
// import { ValidationError, NotFoundError } from "../utils/errors";

// export class OrderService extends BaseService<IOrder> {
//   private tokenService: TokenService;
//   private marketService: MarketService;

//   constructor() {
//     super(Order);
//     this.tokenService = new TokenService();
//     this.marketService = new MarketService();
//   }

//   async createOrder(orderData: {
//     buyer: string;
//     product: string;
//     quantity: number;
//     shippingDetails: any;
//   }): Promise<IOrder> {
//     const product = await this.marketService.findById(orderData.product);

//     if (!product || !product.isAvailable()) {
//       throw new ValidationError("Product is not available");
//     }

//     if (product.quantity < orderData.quantity) {
//       throw new ValidationError("Insufficient product quantity");
//     }

//     const totalPrice = product.price * orderData.quantity;

//     const order = await this.create({
//       ...orderData,
//       seller: product.seller,
//       totalPrice,
//       currency: product.currency,
//       status: "pending",
//       paymentStatus: "pending",
//       shippingStatus: "pending",
//     });

//     // Reserve the product quantity
//     await this.marketService.update(product._id, {
//       quantity: product.quantity - orderData.quantity,
//     });

//     return order;
//   }

//   async processPayment(
//     orderId: string,
//     paymentMethod: string,
//     paymentToken: string
//   ): Promise<{
//     success: boolean;
//     transactionHash?: string;
//     order: IOrder;
//   }> {
//     const order = await this.findById(orderId);

//     if (order.paymentStatus !== "pending") {
//       throw new ValidationError("Order payment already processed");
//     }

//     try {
//       // Process payment based on method
//       if (paymentMethod === "token") {
//         // Use our token system
//         const result = await this.processTokenPayment(
//           order.buyer,
//           order.seller,
//           order.totalPrice,
//           paymentToken
//         );

//         order.transactionHash = result.transactionHash;
//         order.paymentStatus = "completed";
//       } else {
//         // Handle other payment methods
//         throw new ValidationError("Unsupported payment method");
//       }

//       order.status = "processing";
//       await order.save();

//       return {
//         success: true,
//         transactionHash: order.transactionHash,
//         order,
//       };
//     } catch (error) {
//       order.paymentStatus = "failed";
//       await order.save();
//       throw error;
//     }
//   }

//   private async processTokenPayment(
//     buyerAddress: string,
//     sellerAddress: string,
//     amount: number,
//     paymentToken: string
//   ): Promise<{
//     success: boolean;
//     transactionHash: string;
//   }> {
//     // Verify buyer has sufficient tokens
//     const buyerBalance = await this.tokenService.getTokenBalance(buyerAddress);
//     if (buyerBalance.available < amount) {
//       throw new ValidationError("Insufficient token balance");
//     }

//     // Process token transfer
//     try {
//       const transaction = await this.tokenService.delegate(
//         buyerAddress,
//         sellerAddress,
//         amount
//       );

//       return {
//         success: true,
//         transactionHash: `tx_${Date.now()}`, // Replace with actual transaction hash
//       };
//     } catch (error) {
//       throw new Error("Token transfer failed");
//     }
//   }

//   async updateOrderStatus(
//     orderId: string,
//     newStatus: OrderStatus,
//     userId: string
//   ): Promise<IOrder> {
//     const order = await this.findById(orderId);

//     // Verify user has permission
//     if (order.seller.toString() !== userId) {
//       throw new ValidationError("Not authorized to update this order");
//     }

//     // Validate status transition
//     const validTransitions: Record<OrderStatus, OrderStatus[]> = {
//       pending: ["processing", "cancelled"],
//       processing: ["shipped", "cancelled"],
//       shipped: ["delivered", "disputed"],
//       delivered: ["disputed"],
//       disputed: ["delivered", "cancelled"],
//       cancelled: [],
//     };

//     if (!validTransitions[order.status].includes(newStatus)) {
//       throw new ValidationError("Invalid status transition");
//     }

//     order.status = newStatus;

//     // Handle status-specific logic
//     if (newStatus === "shipped") {
//       order.shippingStatus = "shipped";
//     } else if (newStatus === "delivered") {
//       order.shippingStatus = "delivered";
//     }

//     return order.save();
//   }

//   async updateShippingStatus(
//     orderId: string,
//     shippingData: {
//       trackingNumber: string;
//       carrier: string;
//       status: string;
//     }
//   ): Promise<IOrder> {
//     const order = await this.findById(orderId);

//     order.trackingNumber = shippingData.trackingNumber;
//     order.carrier = shippingData.carrier;
//     order.shippingStatus = shippingData.status as any;

//     return order.save();
//   }

//   async getUserOrders(
//     userId: string,
//     options: {
//       status?: OrderStatus;
//       page?: number;
//       limit?: number;
//     }
//   ): Promise<{
//     orders: IOrder[];
//     total: number;
//     page: number;
//     totalPages: number;
//   }> {
//     const { status, page = 1, limit = 10 } = options;

//     const query: any = { buyer: userId };
//     if (status) query.status = status;

//     const skip = (page - 1) * limit;

//     const [orders, total] = await Promise.all([
//       this.model
//         .find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("product")
//         .populate("seller", "username reputation"),
//       this.model.countDocuments(query),
//     ]);

//     return {
//       orders,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     };
//   }

//   async createDispute(
//     orderId: string,
//     userId: string,
//     disputeData: {
//       reason: string;
//       description: string;
//     }
//   ): Promise<IDispute> {
//     const order = await this.findById(orderId);

//     // Verify user is involved in the order
//     if (
//       order.buyer.toString() !== userId &&
//       order.seller.toString() !== userId
//     ) {
//       throw new ValidationError(
//         "Not authorized to create dispute for this order"
//       );
//     }

//     // Create dispute
//     const dispute = await Dispute.create({
//       order: orderId,
//       initiator: userId,
//       ...disputeData,
//       status: "open",
//     });

//     // Update order status
//     order.status = "disputed";
//     await order.save();

//     return dispute;
//   }

//   async getOrderAnalytics(
//     userId: string,
//     period: string = "1month"
//   ): Promise<OrderAnalytics> {
//     // Implementation would depend on your analytics requirements
//     // This is a placeholder
//     const orders = await this.model.find({
//       $or: [{ buyer: userId }, { seller: userId }],
//     });

//     return {
//       totalOrders: orders.length,
//       totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
//       averageOrderValue:
//         orders.reduce((sum, order) => sum + order.totalPrice, 0) /
//         orders.length,
//       statusBreakdown: this.calculateStatusBreakdown(orders),
//       revenueByPeriod: [],
//       topProducts: [],
//       paymentMethodBreakdown: {},
//     };
//   }

//   private calculateStatusBreakdown(
//     orders: IOrder[]
//   ): Record<OrderStatus, number> {
//     return orders.reduce((acc, order) => {
//       acc[order.status] = (acc[order.status] || 0) + 1;
//       return acc;
//     }, {} as Record<OrderStatus, number>);
//   }
// }
