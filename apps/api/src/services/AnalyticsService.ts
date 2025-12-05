// // src/services/AnalyticsService.ts
// import { MarketService } from "./MarketService";
// import { OrderService } from "./OrderService";
// import { TokenService } from "./TokenService";

// interface TimeRange {
//   startDate: Date;
//   endDate: Date;
// }

// interface MarketMetrics {
//   totalVolume: number;
//   totalOrders: number;
//   averageOrderValue: number;
//   activeSellers: number;
//   topCategories: Array<{
//     category: string;
//     sales: number;
//     volume: number;
//   }>;
//   salesTrend: Array<{
//     date: Date;
//     sales: number;
//     orders: number;
//   }>;
// }

// interface SellerMetrics {
//   revenue: number;
//   orderCount: number;
//   averageRating: number;
//   topProducts: Array<{
//     productId: string;
//     name: string;
//     sales: number;
//     revenue: number;
//   }>;
//   conversionRate: number;
//   customerRetention: number;
// }

// export class AnalyticsService {
//   constructor(
//     private marketService: MarketService,
//     private orderService: OrderService,
//     private tokenService: TokenService
//   ) {}

//   async getMarketMetrics(timeRange: TimeRange): Promise<MarketMetrics> {
//     const [orders, products, categories] = await Promise.all([
//       this.orderService.getOrdersInRange(timeRange),
//       this.marketService.getActiveProducts(),
//       this.marketService.getCategories(),
//     ]);

//     // Calculate basic metrics
//     const totalVolume = orders.reduce(
//       (sum, order) => sum + order.totalPrice,
//       0
//     );
//     const uniqueSellers = new Set(
//       orders.map((order) => order.seller.toString())
//     );

//     // Calculate category performance
//     const categoryMetrics = this.calculateCategoryMetrics(orders, categories);

//     // Calculate sales trend
//     const salesTrend = await this.calculateSalesTrend(timeRange);

//     return {
//       totalVolume,
//       totalOrders: orders.length,
//       averageOrderValue: totalVolume / orders.length,
//       activeSellers: uniqueSellers.size,
//       topCategories: categoryMetrics,
//       salesTrend,
//     };
//   }

//   async getSellerMetrics(
//     sellerId: string,
//     timeRange: TimeRange
//   ): Promise<SellerMetrics> {
//     const [orders, products] = await Promise.all([
//       this.orderService.getSellerOrders(sellerId, timeRange),
//       this.marketService.getSellerProducts(sellerId),
//     ]);

//     // Calculate revenue and order metrics
//     const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

//     // Calculate product performance
//     const productMetrics = this.calculateProductMetrics(orders, products);

//     // Calculate conversion rate
//     const productViews = products.reduce(
//       (sum, product) => sum + product.views,
//       0
//     );
//     const conversionRate = (orders.length / productViews) * 100;

//     // Calculate customer retention
//     const retention = await this.calculateCustomerRetention(
//       sellerId,
//       timeRange
//     );

//     return {
//       revenue,
//       orderCount: orders.length,
//       averageRating: await this.calculateAverageRating(sellerId),
//       topProducts: productMetrics,
//       conversionRate,
//       customerRetention: retention,
//     };
//   }

//   private async calculateSalesTrend(timeRange: TimeRange) {
//     const dailyMetrics = [];
//     let currentDate = new Date(timeRange.startDate);

//     while (currentDate <= timeRange.endDate) {
//       const dayOrders = await this.orderService.getOrdersByDate(currentDate);
//       dailyMetrics.push({
//         date: new Date(currentDate),
//         sales: dayOrders.reduce((sum, order) => sum + order.totalPrice, 0),
//         orders: dayOrders.length,
//       });
//       currentDate.setDate(currentDate.getDate() + 1);
//     }

//     return dailyMetrics;
//   }

//   private calculateCategoryMetrics(orders: any[], categories: any[]) {
//     const categoryStats = new Map();

//     orders.forEach((order) => {
//       const category = categories.find(
//         (c) => c._id.toString() === order.product.category.toString()
//       );
//       if (category) {
//         const stats = categoryStats.get(category._id) || {
//           category: category.name,
//           sales: 0,
//           volume: 0,
//         };
//         stats.sales++;
//         stats.volume += order.totalPrice;
//         categoryStats.set(category._id, stats);
//       }
//     });

//     return Array.from(categoryStats.values())
//       .sort((a, b) => b.volume - a.volume)
//       .slice(0, 10);
//   }

//   private calculateProductMetrics(orders: any[], products: any[]) {
//     const productStats = new Map();

//     orders.forEach((order) => {
//       const stats = productStats.get(order.product._id) || {
//         productId: order.product._id,
//         name: order.product.title,
//         sales: 0,
//         revenue: 0,
//       };
//       stats.sales++;
//       stats.revenue += order.totalPrice;
//       productStats.set(order.product._id, stats);
//     });

//     return Array.from(productStats.values())
//       .sort((a, b) => b.revenue - a.revenue)
//       .slice(0, 5);
//   }

//   private async calculateCustomerRetention(
//     sellerId: string,
//     timeRange: TimeRange
//   ) {
//     const orders = await this.orderService.getSellerOrders(sellerId, timeRange);
//     const customers = new Map();

//     orders.forEach((order) => {
//       const buyerOrders = customers.get(order.buyer) || [];
//       buyerOrders.push(order);
//       customers.set(order.buyer, buyerOrders);
//     });

//     const repeatCustomers = Array.from(customers.values()).filter(
//       (buyerOrders) => buyerOrders.length > 1
//     ).length;

//     return (repeatCustomers / customers.size) * 100;
//   }

//   private async calculateAverageRating(sellerId: string) {
//     const reviews = await this.marketService.getSellerReviews(sellerId);
//     if (!reviews.length) return 0;
//     return (
//       reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
//     );
//   }
// }
