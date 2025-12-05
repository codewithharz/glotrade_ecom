// // src/services/ReportingService.ts
// import { MarketService } from "./MarketService";
// import { OrderService } from "./OrderService";
// import { InventoryService } from "./InventoryService";

// interface ReportOptions {
//   startDate: Date;
//   endDate: Date;
//   groupBy?: "day" | "week" | "month";
//   filters?: Record<string, any>;
// }

// interface ReportResult {
//   data: any[];
//   summary: Record<string, any>;
//   metadata: {
//     generatedAt: Date;
//     period: string;
//     filters: Record<string, any>;
//   };
// }

// export class ReportingService {
//   constructor(
//     private marketService: MarketService,
//     private orderService: OrderService,
//     private inventoryService: InventoryService
//   ) {}

//   async generateSalesReport(options: ReportOptions): Promise<ReportResult> {
//     const orders = await this.orderService.getOrdersInRange({
//       startDate: options.startDate,
//       endDate: options.endDate,
//     });

//     const groupedData = this.groupDataByPeriod(
//       orders,
//       options.groupBy || "day"
//     );

//     const summary = {
//       totalOrders: orders.length,
//       totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
//       averageOrderValue:
//         orders.reduce((sum, order) => sum + order.totalPrice, 0) /
//         orders.length,
//       topProducts: await this.getTopProducts(orders),
//       paymentMethods: this.summarizePaymentMethods(orders),
//     };

//     return {
//       data: groupedData,
//       summary,
//       metadata: {
//         generatedAt: new Date(),
//         period: `${options.startDate.toISOString()} - ${options.endDate.toISOString()}`,
//         filters: options.filters || {},
//       },
//     };
//   }

//   async generateInventoryReport(options: ReportOptions): Promise<ReportResult> {
//     const products = await this.marketService.getActiveProducts();
//     const stockMovements = await this.inventoryService.getStockMovementHistory(
//       undefined,
//       { start: options.startDate, end: options.endDate }
//     );

//     const summary = {
//       totalProducts: products.length,
//       totalStock: products.reduce((sum, product) => sum + product.quantity, 0),
//       lowStockItems: products.filter((p) => p.quantity <= p.lowStockThreshold)
//         .length,
//       stockValue: products.reduce((sum, p) => sum + p.quantity * p.price, 0),
//     };

//     return {
//       data: this.analyzeInventoryMovements(stockMovements),
//       summary,
//       metadata: {
//         generatedAt: new Date(),
//         period: `${options.startDate.toISOString()} - ${options.endDate.toISOString()}`,
//         filters: options.filters || {},
//       },
//     };
//   }

//   async generateSellerReport(
//     sellerId: string,
//     options: ReportOptions
//   ): Promise<ReportResult> {
//     const sellerOrders = await this.orderService.getSellerOrders(sellerId, {
//       startDate: options.startDate,
//       endDate: options.endDate,
//     });

//     const products = await this.marketService.getSellerProducts(sellerId);

//     const summary = {
//       totalRevenue: sellerOrders.reduce(
//         (sum, order) => sum + order.totalPrice,
//         0
//       ),
//       orderCount: sellerOrders.length,
//       productCount: products.length,
//       averageRating: await this.calculateAverageRating(sellerId),
//       topSellingProducts: await this.getTopProducts(sellerOrders),
//     };

//     return {
//       data: this.groupDataByPeriod(sellerOrders, options.groupBy || "day"),
//       summary,
//       metadata: {
//         generatedAt: new Date(),
//         period: `${options.startDate.toISOString()} - ${options.endDate.toISOString()}`,
//         filters: options.filters || {},
//       },
//     };
//   }

//   private groupDataByPeriod(
//     data: any[],
//     period: "day" | "week" | "month"
//   ): any[] {
//     const groupedData = new Map();

//     data.forEach((item) => {
//       const date = new Date(item.createdAt);
//       let key: string;

//       switch (period) {
//         case "day":
//           key = date.toISOString().split("T")[0];
//           break;
//         case "week":
//           const weekStart = new Date(date);
//           weekStart.setDate(date.getDate() - date.getDay());
//           key = weekStart.toISOString().split("T")[0];
//           break;
//         case "month":
//           key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
//             2,
//             "0"
//           )}`;
//           break;
//       }

//       const existing = groupedData.get(key) || {
//         period: key,
//         count: 0,
//         revenue: 0,
//         items: [],
//       };

//       existing.count++;
//       existing.revenue += item.totalPrice;
//       existing.items.push(item);

//       groupedData.set(key, existing);
//     });

//     return Array.from(groupedData.values());
//   }

//   private async getTopProducts(orders: any[]): Promise<any[]> {
//     const productCounts = new Map();

//     orders.forEach((order) => {
//       const count = productCounts.get(order.product) || {
//         count: 0,
//         revenue: 0,
//       };
//       count.count += order.quantity;
//       count.revenue += order.totalPrice;
//       productCounts.set(order.product, count);
//     });

//     const products = await Promise.all(
//       Array.from(productCounts.keys()).map((id) =>
//         this.marketService.findById(id)
//       )
//     );

//     return products
//       .map((product) => ({
//         product,
//         ...productCounts.get(product._id),
//       }))
//       .sort((a, b) => b.revenue - a.revenue);
//   }

//   private summarizePaymentMethods(orders: any[]): Record<string, number> {
//     return orders.reduce((acc, order) => {
//       acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
//       return acc;
//     }, {});
//   }

//   private analyzeInventoryMovements(movements: any[]): any[] {
//     return movements.reduce((acc, movement) => {
//       const existing = acc.find((m) => m.productId === movement.productId);
//       if (existing) {
//         existing.movements.push(movement);
//         existing.netChange += movement.quantity;
//       } else {
//         acc.push({
//           productId: movement.productId,
//           movements: [movement],
//           netChange: movement.quantity,
//         });
//       }
//       return acc;
//     }, []);
//   }

//   private async calculateAverageRating(sellerId: string): Promise<number> {
//     const reviews = await this.marketService.getSellerReviews(sellerId);
//     if (!reviews.length) return 0;
//     return (
//       reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
//     );
//   }
// }
