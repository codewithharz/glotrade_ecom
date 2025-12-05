// // src/services/ShippingService.ts
// import { OrderService } from "./OrderService";
// import { ValidationError } from "../utils/errors";
// import { createHmac } from "crypto";

// interface ShippingUpdate {
//   carrier: string;
//   trackingNumber: string;
//   status: string;
//   location?: string;
//   timestamp: Date;
//   details?: string;
// }

// export class ShippingService {
//   private orderService: OrderService;
//   private webhookSecret: string;

//   constructor() {
//     this.orderService = new OrderService();
//     this.webhookSecret =
//       process.env.SHIPPING_WEBHOOK_SECRET || "your-secret-key";
//   }

//   async handleShippingWebhook(payload: any, signature: string): Promise<void> {
//     // Verify webhook signature
//     if (!this.verifyWebhookSignature(payload, signature)) {
//       throw new ValidationError("Invalid webhook signature");
//     }

//     const update: ShippingUpdate = {
//       carrier: payload.carrier,
//       trackingNumber: payload.tracking_number,
//       status: this.normalizeShippingStatus(payload.status),
//       location: payload.location,
//       timestamp: new Date(payload.timestamp),
//       details: payload.details,
//     };

//     // Find order by tracking number
//     const order = await this.orderService.findByTracking(update.trackingNumber);

//     if (!order) {
//       throw new ValidationError("Order not found for tracking number");
//     }

//     // Update shipping status
//     await this.orderService.updateShippingStatus(order._id, {
//       trackingNumber: update.trackingNumber,
//       carrier: update.carrier,
//       status: update.status,
//     });

//     // If delivered, trigger escrow release countdown
//     if (update.status === "delivered") {
//       await this.startEscrowReleaseCountdown(order._id);
//     }
//   }

//   private verifyWebhookSignature(payload: any, signature: string): boolean {
//     const hmac = createHmac("sha256", this.webhookSecret);
//     const calculatedSignature = hmac
//       .update(JSON.stringify(payload))
//       .digest("hex");
//     return calculatedSignature === signature;
//   }

//   private normalizeShippingStatus(carrierStatus: string): string {
//     // Map carrier-specific status to our standard statuses
//     const statusMap: Record<string, string> = {
//       in_transit: "shipped",
//       out_for_delivery: "shipped",
//       delivered: "delivered",
//       failed_attempt: "shipped",
//       exception: "exception",
//       // Add more mappings as needed
//     };

//     return statusMap[carrierStatus.toLowerCase()] || "unknown";
//   }

//   private async startEscrowReleaseCountdown(orderId: string): Promise<void> {
//     // Start countdown for automatic escrow release
//     // This could be implemented with a job queue
//     setTimeout(async () => {
//       try {
//         await this.orderService.tryAutoReleaseEscrow(orderId);
//       } catch (error) {
//         console.error("Failed to auto-release escrow:", error);
//       }
//     }, 3 * 24 * 60 * 60 * 1000); // 3 days
//   }
// }
