import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Commodity } from "../models";

/**
 * Commodity Controller
 * Handles commodity price updates and tracking
 */

/**
 * Update commodity price (Admin)
 */
export const updateCommodityPrice = async (req: AuthRequest, res: Response) => {
    try {
        const { commodityId } = req.params;
        const { currentMarketPrice, pricePerUnit } = req.body;

        if (!currentMarketPrice && !pricePerUnit) {
            return res.status(400).json({ error: "Price information required" });
        }

        const commodity = await Commodity.findById(commodityId);

        if (!commodity) {
            return res.status(404).json({ error: "Commodity not found" });
        }

        // Update prices
        if (currentMarketPrice) {
            commodity.currentMarketPrice = currentMarketPrice;
        }
        if (pricePerUnit) {
            commodity.pricePerUnit = pricePerUnit;
        }

        commodity.lastPriceUpdate = new Date();
        commodity.updatedBy = req.user?._id as any;

        await commodity.save();

        res.json({
            success: true,
            message: "Commodity price updated successfully",
            data: commodity,
        });
    } catch (error) {
        console.error("Error updating commodity price:", error);
        res.status(500).json({ error: "Failed to update commodity price" });
    }
};

/**
 * Bulk update commodity prices (Admin)
 */
export const bulkUpdatePrices = async (req: AuthRequest, res: Response) => {
    try {
        const { updates } = req.body;

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ error: "Invalid updates format" });
        }

        const results = [];

        for (const update of updates) {
            const { commodityType, currentMarketPrice, pricePerUnit } = update;

            await Commodity.updateMany(
                { commodityType, status: "allocated" },
                {
                    $set: {
                        currentMarketPrice,
                        pricePerUnit,
                        lastPriceUpdate: new Date(),
                        updatedBy: req.user?._id as any,
                    },
                }
            );

            results.push({
                commodityType,
                updated: true,
            });
        }

        res.json({
            success: true,
            message: "Commodity prices updated successfully",
            data: results,
        });
    } catch (error) {
        console.error("Error bulk updating prices:", error);
        res.status(500).json({ error: "Failed to bulk update prices" });
    }
};

/**
 * Get commodity market prices
 */
export const getCommodityPrices = async (req: Request, res: Response) => {
    try {
        const { commodityType } = req.query;

        const query: any = {};
        if (commodityType) {
            query.commodityType = commodityType;
        }

        const commodities = await Commodity.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$commodityType",
                    averagePrice: { $avg: "$currentMarketPrice" },
                    minPrice: { $min: "$currentMarketPrice" },
                    maxPrice: { $max: "$currentMarketPrice" },
                    totalQuantity: { $sum: "$quantity" },
                    count: { $sum: 1 },
                    lastUpdate: { $max: "$lastPriceUpdate" },
                },
            },
        ]);

        res.json({
            success: true,
            data: commodities,
        });
    } catch (error) {
        console.error("Error fetching commodity prices:", error);
        res.status(500).json({ error: "Failed to fetch commodity prices" });
    }
};

/**
 * Get commodity backing for TPIA
 */
export const getTPIACommodityBacking = async (req: Request, res: Response) => {
    try {
        const { tpiaId } = req.params;

        const commodities = await Commodity.find({
            allocatedTPIAs: tpiaId,
        });

        if (!commodities || commodities.length === 0) {
            return res.status(404).json({ error: "No commodity backing found" });
        }

        const totalValue = commodities.reduce((sum, c) => sum + (c.currentMarketPrice || 0), 0);
        const totalQuantity = commodities.reduce((sum, c) => sum + c.quantity, 0);

        res.json({
            success: true,
            data: {
                commodities,
                summary: {
                    totalCommodities: commodities.length,
                    totalValue,
                    totalQuantity,
                    types: [...new Set(commodities.map((c) => c.commodityType))],
                },
            },
        });
    } catch (error) {
        console.error("Error fetching commodity backing:", error);
        res.status(500).json({ error: "Failed to fetch commodity backing" });
    }
};

export default {
    updateCommodityPrice,
    bulkUpdatePrices,
    getCommodityPrices,
    getTPIACommodityBacking,
};
