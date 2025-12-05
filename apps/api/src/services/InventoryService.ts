// src/services/InventoryService.ts
import { Product } from "../models";
import { ValidationError } from "../utils/errors";

interface InventoryItem {
  productId: string;
  quantity: number;
  sku?: string;
  lowStockThreshold?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  location?: string;
  status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
}

interface StockMovement {
  productId: string;
  quantity: number;
  type: "in" | "out" | "adjustment" | "reserved" | "released";
  reason: string;
  reference?: string;
  timestamp: Date;
}

export class InventoryService {
  constructor() {}

  async reserveStock(
    productId: string,
    quantity: number,
    orderId: string
  ): Promise<void> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ValidationError("Product not found");
    }

    if (product.quantity < quantity) {
      throw new ValidationError("Insufficient stock available");
    }

    // Reserve stock by reducing available quantity
    await Product.updateOne(
      { _id: productId },
      { $inc: { quantity: -quantity } }
    );

    // Record stock movement
    await this.recordStockMovement({
      productId,
      quantity,
      type: "reserved",
      reason: `Reserved for order ${orderId}`,
      reference: orderId,
      timestamp: new Date(),
    });
  }

  async releaseStock(
    productId: string,
    quantity: number,
    orderId: string,
    reason: string = "Order cancelled or payment failed"
  ): Promise<void> {
    // Release reserved stock back to available
    await Product.updateOne(
      { _id: productId },
      { $inc: { quantity: quantity } }
    );

    // Record stock movement
    await this.recordStockMovement({
      productId,
      quantity,
      type: "released",
      reason,
      reference: orderId,
      timestamp: new Date(),
    });
  }

  async confirmStockDeduction(
    productId: string,
    quantity: number,
    orderId: string
  ): Promise<void> {
    // Stock was already reserved, just record the final movement
    await this.recordStockMovement({
      productId,
      quantity,
      type: "out",
      reason: `Order ${orderId} confirmed and shipped`,
      reference: orderId,
      timestamp: new Date(),
    });
  }

  async adjustStock(
    productId: string,
    adjustment: number,
    reason: string
  ): Promise<InventoryItem> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ValidationError("Product not found");
    }

    const newQuantity = product.quantity + adjustment;
    if (newQuantity < 0) {
      throw new ValidationError("Insufficient stock for adjustment");
    }

    // Update product quantity
    await Product.updateOne(
      { _id: productId },
      { $set: { quantity: newQuantity } }
    );

    // Record stock movement
    await this.recordStockMovement({
      productId,
      quantity: adjustment,
      type: adjustment > 0 ? "in" : "out",
      reason,
      timestamp: new Date(),
    });

    return {
      productId,
      quantity: newQuantity,
      sku: undefined, // Product model doesn't have SKU field
      lowStockThreshold: 5, // Default threshold
      reorderPoint: 2, // Default reorder point
      reorderQuantity: 10, // Default reorder quantity
      status: this.calculateStockStatus(newQuantity, 5),
    };
  }

  async getBatchStockLevels(
    productIds: string[]
  ): Promise<Record<string, number>> {
    const products = await Product.find({ _id: { $in: productIds } }).select('_id quantity');
    
    return products.reduce((acc, product: any) => {
      acc[product._id.toString()] = product.quantity;
      return acc;
    }, {} as Record<string, number>);
  }

  async getLowStockItems(threshold: number = 5): Promise<InventoryItem[]> {
    const products = await Product.find({ 
      quantity: { $lte: threshold, $gt: 0 },
      status: "active"
    });

    return products.map((product: any) => ({
      productId: product._id.toString(),
      quantity: product.quantity,
      sku: undefined, // Product model doesn't have SKU field
      lowStockThreshold: 5, // Default threshold
      reorderPoint: 2, // Default reorder point
      reorderQuantity: 10, // Default reorder quantity
      status: "low_stock",
    }));
  }

  async getStockMovementHistory(
    productId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<StockMovement[]> {
    // This would typically query a separate StockMovement collection
    // For now, return empty array as placeholder
    return [];
  }

  private calculateStockStatus(
    quantity: number,
    lowStockThreshold: number
  ): InventoryItem["status"] {
    if (quantity <= 0) return "out_of_stock";
    if (quantity <= lowStockThreshold) return "low_stock";
    return "in_stock";
  }

  private async recordStockMovement(movement: StockMovement): Promise<void> {
    // In a production system, this would save to a StockMovement collection
    // For now, just log it
    console.log("Stock movement recorded:", movement);
  }
}
