import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import Order from "../models/Order";
import Product from "../models/Product";

dotenv.config();

async function run() {
    try {
        await connectDB();
        console.log("Connected to database...");

        // 1. Calculate Total Revenue (Completed Orders)
        // Based on AdminService.ts logic: status in ['delivered', 'completed', 'processing', 'shipped'] and paymentStatus in ['completed', 'paid']
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['delivered', 'completed', 'processing', 'shipped'] },
                    paymentStatus: { $in: ['completed', 'paid'] }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // 2. Calculate Total Inventory Value
        // Sum of (price * quantity) for all products
        const inventoryResult = await Product.aggregate([
            {
                $match: {
                    quantity: { $gt: 0 }
                }
            },
            {
                $project: {
                    value: { $multiply: ["$price", "$quantity"] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$value" }
                }
            }
        ]);
        const totalInventoryValue = inventoryResult[0]?.total || 0;

        console.log("\n=== PLATFORM WORTH ANALYSIS ===");
        console.log(`Total Revenue (Completed Orders): ₦${totalRevenue.toLocaleString()}`);
        console.log(`Total Inventory Value (Retail):   ₦${totalInventoryValue.toLocaleString()}`);
        console.log("===============================\n");

        process.exit(0);
    } catch (error) {
        console.error("Error calculating platform worth:", error);
        process.exit(1);
    }
}

run();
