// // src/services/BatchOrderService.ts
// import { OrderService } from "./OrderService";
// import { InventoryService } from "./InventoryService";
// import { NotificationService } from "./NotificationService";
// import { ValidationError } from "../utils/errors";
// import { IOrder } from "../types/order.types";

// interface BatchOrderResult {
//   success: boolean;
//   orderId?: string;
//   error?: string;
// }

// interface BatchProcessResult {
//   successful: BatchOrderResult[];
//   failed: BatchOrderResult[];
//   summary: {
//     total: number;
//     succeeded: number;
//     failed: number;
//     totalValue: number;
//   };
// }

// export class BatchOrderService {
//   constructor(
//     private orderService: OrderService,
//     private inventoryService: InventoryService,
//     private notificationService: NotificationService
//   ) {}

//   async processBatchOrders(
//     orders: Partial<IOrder>[]
//   ): Promise<BatchProcessResult> {
//     const results: BatchProcessResult = {
//       successful: [],
//       failed: [],
//       summary: {
//         total: orders.length,
//         succeeded: 0,
//         failed: 0,
//         totalValue: 0,
//       },
//     };

//     // Pre-validate inventory for all orders
//     const inventoryValidation = await this.validateBatchInventory(orders);
//     if (!inventoryValidation.valid) {
//       throw new ValidationError("Insufficient inventory for batch processing");
//     }

//     // Process orders in parallel with concurrency limit
//     const BATCH_SIZE = 5;
//     for (let i = 0; i < orders.length; i += BATCH_SIZE) {
//       const batch = orders.slice(i, i + BATCH_SIZE);
//       const batchResults = await Promise.allSettled(
//         batch.map((order) => this.processOrder(order))
//       );

//       batchResults.forEach((result, index) => {
//         if (result.status === "fulfilled") {
//           results.successful.push({
//             success: true,
//             orderId: result.value._id,
//           });
//           results.summary.succeeded++;
//           results.summary.totalValue += result.value.totalPrice;
//         } else {
//           results.failed.push({
//             success: false,
//             error: result.reason.message,
//             orderId: batch[index].orderId,
//           });
//           results.summary.failed++;
//         }
//       });

//       // Notify progress
//       await this.notificationService.notifyBatchProgress({
//         processed: i + batch.length,
//         total: orders.length,
//         successful: results.summary.succeeded,
//         failed: results.summary.failed,
//       });
//     }

//     return results;
//   }

//   async bulkUpdateOrders(
//     orderIds: string[],
//     update: Partial<IOrder>
//   ): Promise<BatchProcessResult> {
//     const results: BatchProcessResult = {
//       successful: [],
//       failed: [],
//       summary: {
//         total: orderIds.length,
//         succeeded: 0,
//         failed: 0,
//         totalValue: 0,
//       },
//     };

//     const BATCH_SIZE = 10;
//     for (let i = 0; i < orderIds.length; i += BATCH_SIZE) {
//       const batchIds = orderIds.slice(i, i + BATCH_SIZE);
//       const batchResults = await Promise.allSettled(
//         batchIds.map((id) => this.orderService.update(id, update))
//       );

//       batchResults.forEach((result, index) => {
//         if (result.status === "fulfilled") {
//           results.successful.push({
//             success: true,
//             orderId: batchIds[index],
//           });
//           results.summary.succeeded++;
//           results.summary.totalValue += result.value.totalPrice;
//         } else {
//           results.failed.push({
//             success: false,
//             error: result.reason.message,
//             orderId: batchIds[index],
//           });
//           results.summary.failed++;
//         }
//       });
//     }

//     return results;
//   }

//   private async validateBatchInventory(
//     orders: Partial<IOrder>[]
//   ): Promise<{ valid: boolean; issues?: string[] }> {
//     // Group orders by product to calculate total quantities needed
//     const productQuantities = new Map<string, number>();

//     orders.forEach((order) => {
//       const currentQty = productQuantities.get(order.product as string) || 0;
//       productQuantities.set(
//         order.product as string,
//         currentQty + (order.quantity || 0)
//       );
//     });

//     // Check inventory levels
//     const inventoryLevels = await this.inventoryService.getBatchStockLevels(
//       Array.from(productQuantities.keys())
//     );

//     const issues: string[] = [];
//     for (const [productId, requiredQty] of productQuantities.entries()) {
//       if (
//         !inventoryLevels[productId] ||
//         inventoryLevels[productId] < requiredQty
//       ) {
//         issues.push(`Insufficient inventory for product ${productId}`);
//       }
//     }

//     return {
//       valid: issues.length === 0,
//       issues,
//     };
//   }

//   private async processOrder(orderData: Partial<IOrder>): Promise<IOrder> {
//     try {
//       // Reserve inventory
//       await this.inventoryService.reserveStock(
//         orderData.product as string,
//         orderData.quantity || 0,
//         orderData._id as string
//       );

//       // Create order
//       const order = await this.orderService.createOrder(orderData as any);

//       // Notify relevant parties
//       await this.notificationService.sendOrderNotifications(order);

//       return order;
//     } catch (error) {
//       // Release inventory if order fails
//       if (orderData.product && orderData.quantity) {
//         await this.inventoryService.releaseStock(
//           orderData.product as string,
//           orderData.quantity,
//           orderData._id as string
//         );
//       }
//       throw error;
//     }
//   }
// }
