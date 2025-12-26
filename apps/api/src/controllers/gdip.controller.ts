import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import GDIPService from "../services/GDIPService";
import TradeCycleService from "../services/TradeCycleService";
import { Schema } from "mongoose";

/**
 * GDIP Controller - Handles API requests for Trusted Insured Partners platform
 */
export class GDIPController {
    /**
     * Purchase a new TPIA block
     * POST /api/gdip/tpia/purchase
     */
    static async purchaseTPIA(req: AuthRequest, res: Response) {
        try {
            const { commodityType, profitMode, purchasePrice, quantity } = req.body;
            const partnerId = req.user?._id;

            if (!partnerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!commodityType) {
                return res.status(400).json({ error: "Commodity type is required" });
            }

            const qty = parseInt(quantity as string) || 1;
            const tpias = await GDIPService.purchaseBulk(
                partnerId as unknown as Schema.Types.ObjectId,
                commodityType,
                profitMode || "TPM",
                qty
            );

            res.status(201).json({
                success: true,
                message: qty > 1 ? `Successfully purchased ${tpias.length} TPIA blocks` : `Successfully purchased TPIA`,
                data: qty > 1 ? tpias : tpias[0]
            });
        } catch (error: any) {
            console.error("Error purchasing TPIA:", error);
            res.status(500).json({
                error: error.message || "Failed to purchase TPIA"
            });
        }
    }

    /**
     * Get partner's portfolio
     * GET /api/gdip/portfolio
     */
    static async getPortfolio(req: AuthRequest, res: Response) {
        try {
            const partnerId = req.user?._id;

            if (!partnerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const portfolio = await GDIPService.getPartnerPortfolio(
                partnerId as unknown as Schema.Types.ObjectId
            );

            res.json({
                success: true,
                data: portfolio
            });
        } catch (error: any) {
            console.error("Error fetching portfolio:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch portfolio"
            });
        }
    }

    /**
     * Get partner's TPIAs
     * GET /api/gdip/tpias
     */
    static async getTPIAs(req: AuthRequest, res: Response) {
        try {
            const partnerId = req.user?._id;

            if (!partnerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const tpias = await GDIPService.getPartnerTPIAs(
                partnerId as unknown as Schema.Types.ObjectId
            );

            res.json({
                success: true,
                count: tpias.length,
                data: tpias
            });
        } catch (error: any) {
            console.error("Error fetching TPIAs:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch TPIAs"
            });
        }
    }

    /**
     * Get TPIA details
     * GET /api/gdip/tpia/:tpiaId
     */
    static async getTPIADetails(req: Request, res: Response) {
        try {
            const { tpiaId } = req.params;

            const details = await GDIPService.getTPIADetails(
                tpiaId as unknown as Schema.Types.ObjectId
            );

            res.json({
                success: true,
                data: details
            });
        } catch (error: any) {
            console.error("Error fetching TPIA details:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch TPIA details"
            });
        }
    }

    /**
     * Get GDC details
     * GET /api/gdip/gdc/:gdcId
     */
    static async getGDCDetails(req: Request, res: Response) {
        try {
            const { gdcId } = req.params;

            const details = await GDIPService.getGDCDetails(
                gdcId as unknown as Schema.Types.ObjectId
            );

            res.json({
                success: true,
                data: details
            });
        } catch (error: any) {
            console.error("Error fetching GDC details:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch GDC details"
            });
        }
    }

    /**
     * Switch TPIA profit mode
     * PUT /api/gdip/tpia/:tpiaId/profit-mode
     */
    static async switchProfitMode(req: Request, res: Response) {
        try {
            const { tpiaId } = req.params;
            const { profitMode } = req.body;

            if (!profitMode || !["TPM", "EPS"].includes(profitMode)) {
                return res.status(400).json({
                    error: "Valid profit mode required (TPM or EPS)"
                });
            }

            const tpia = await GDIPService.switchProfitMode(
                tpiaId as unknown as Schema.Types.ObjectId,
                profitMode
            );

            res.json({
                success: true,
                message: `Profit mode switched to ${profitMode}`,
                data: tpia
            });
        } catch (error: any) {
            console.error("Error switching profit mode:", error);
            res.status(500).json({
                error: error.message || "Failed to switch profit mode"
            });
        }
    }

    /**
     * Get TPIA trade cycles
     * GET /api/gdip/tpia/:tpiaId/cycles
     */
    static async getTPIACycles(req: Request, res: Response) {
        try {
            const { tpiaId } = req.params;
            const limit = parseInt(req.query.limit as string) || 10;

            const cycles = await TradeCycleService.getTPIACycles(
                tpiaId as unknown as Schema.Types.ObjectId,
                limit
            );

            res.json({
                success: true,
                count: cycles.length,
                data: cycles
            });
        } catch (error: any) {
            console.error("Error fetching TPIA cycles:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch cycles"
            });
        }
    }

    /**
     * ADMIN: Create trade cycle
     * POST /api/gdip/admin/cycle/create
     */
    static async createTradeCycle(req: Request, res: Response) {
        try {
            const { gdcId, commodityType, commodityQuantity, purchasePrice, startDate } = req.body;

            if (!gdcId || !commodityType || !commodityQuantity || !purchasePrice) {
                return res.status(400).json({
                    error: "Missing required fields"
                });
            }

            const cycle = await TradeCycleService.createTradeCycle(
                gdcId as unknown as Schema.Types.ObjectId,
                commodityType,
                commodityQuantity,
                purchasePrice,
                startDate ? new Date(startDate) : undefined
            );

            res.status(201).json({
                success: true,
                message: "Trade cycle created successfully",
                data: cycle
            });
        } catch (error: any) {
            console.error("Error creating trade cycle:", error);
            res.status(500).json({
                error: error.message || "Failed to create trade cycle"
            });
        }
    }

    /**
     * ADMIN: Complete trade cycle
     * POST /api/gdip/admin/cycle/:cycleId/complete
     */
    static async completeTradeCycle(req: Request, res: Response) {
        try {
            const { cycleId } = req.params;
            const { salePrice, tradingCosts } = req.body;

            if (!salePrice) {
                return res.status(400).json({ error: "Sale price is required" });
            }

            const cycle = await TradeCycleService.completeCycle(
                cycleId as unknown as Schema.Types.ObjectId,
                salePrice,
                tradingCosts || 0
            );

            res.json({
                success: true,
                message: "Trade cycle completed successfully",
                data: cycle
            });
        } catch (error: any) {
            console.error("Error completing trade cycle:", error);
            res.status(500).json({
                error: error.message || "Failed to complete trade cycle"
            });
        }
    }

    /**
     * ADMIN: Distribute profits
     * POST /api/gdip/admin/cycle/:cycleId/distribute
     */
    static async distributeProfits(req: Request, res: Response) {
        try {
            const { cycleId } = req.params;

            await TradeCycleService.distributeProfits(
                cycleId as unknown as Schema.Types.ObjectId
            );

            res.json({
                success: true,
                message: "Profits distributed successfully"
            });
        } catch (error: any) {
            console.error("Error distributing profits:", error);
            res.status(500).json({
                error: error.message || "Failed to distribute profits"
            });
        }
    }

    /**
     * ADMIN: Get all GDCs
     * GET /api/gdip/admin/gdcs
     */
    static async getAllGDCs(req: Request, res: Response) {
        try {
            const GDC = require("../models/GDC").default;
            const TradeCycle = require("../models/TradeCycle").default;

            const gdcs = await GDC.find().sort({ gdcNumber: 1 });

            // Fetch all active cycles to calculate estimated profit
            const activeCycles = await TradeCycle.find({
                status: { $in: ["active", "scheduled"] }
            });

            // Map cycles to GDCs
            const cycleMap = new Map();
            activeCycles.forEach((cycle: any) => {
                cycleMap.set(cycle.gdcId.toString(), cycle);
            });

            const gdcsWithEstimates = gdcs.map((gdc: any) => {
                let estimatedProfit = 0;
                const cycle = cycleMap.get(gdc._id.toString());

                if (cycle && cycle.startDate && cycle.endDate && cycle.targetProfitRate) {
                    const start = new Date(cycle.startDate).getTime();
                    const end = new Date(cycle.endDate).getTime();
                    const now = Date.now();

                    if (now > start && now < end) {
                        const progress = (now - start) / (end - start);
                        const totalTarget = (cycle.targetProfitRate / 100) * gdc.totalCapital;
                        estimatedProfit = totalTarget * progress;
                    } else if (now >= end) {
                        estimatedProfit = (cycle.targetProfitRate / 100) * gdc.totalCapital;
                    }
                }

                // Return GDC with estimated profit added to totalProfitGenerated
                // We keep original totalProfitGenerated (realized) and add estimated
                const gdcObj = gdc.toObject();
                gdcObj.totalProfitGenerated = (gdc.totalProfitGenerated || 0) + estimatedProfit;
                gdcObj.estimatedProfit = estimatedProfit; // Also sending separately just in case
                return gdcObj;
            });

            res.json({
                success: true,
                count: gdcsWithEstimates.length,
                data: gdcsWithEstimates
            });
        } catch (error: any) {
            console.error("Error fetching GDCs:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch GDCs"
            });
        }
    }

    /**
     * ADMIN: Get all TPIAs
     * GET /api/gdip/admin/tpias
     */
    static async getAllTPIAs(req: Request, res: Response) {
        try {
            const TPIA = require("../models/TPIA").default;
            const status = req.query.status as string;

            const query = status ? { status } : {};
            const tpias = await TPIA.find(query).populate("currentCycleId").sort({ tpiaNumber: 1 });

            // Calculate estimated accrued profit for each TPIA
            const tpiasWithEstimates = tpias.map((tpia: any) => {
                let estimatedProfit = 0;

                if (tpia.currentCycleId && typeof tpia.currentCycleId === 'object') {
                    const cycle = tpia.currentCycleId as any;
                    if (cycle.startDate && cycle.endDate && cycle.targetProfitRate) {
                        const start = new Date(cycle.startDate).getTime();
                        const end = new Date(cycle.endDate).getTime();
                        const now = Date.now();

                        if (now > start && now < end) {
                            const progress = (now - start) / (end - start);
                            const totalTarget = (cycle.targetProfitRate / 100) * tpia.purchasePrice;
                            estimatedProfit = totalTarget * progress;
                        } else if (now >= end && cycle.status !== 'completed') {
                            // Cycle ended but not completed yet, show full target
                            estimatedProfit = (cycle.targetProfitRate / 100) * tpia.purchasePrice;
                        }
                    }
                }

                return { ...tpia.toObject(), estimatedProfit };
            });

            res.json({
                success: true,
                count: tpiasWithEstimates.length,
                data: tpiasWithEstimates
            });
        } catch (error: any) {
            console.error("Error fetching TPIAs:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch TPIAs"
            });
        }
    }

    /**
     * ADMIN: Get all trade cycles
     * GET /api/gdip/admin/cycles
     */
    static async getAllCycles(req: Request, res: Response) {
        try {
            const TradeCycle = require("../models/TradeCycle").default;
            const status = req.query.status as string;

            const query = status ? { status } : {};
            const cycles = await TradeCycle.find(query).sort({ cycleNumber: -1 });

            const cyclesWithProfit = cycles.map((cycle: any) => {
                let currentProfit = 0;

                // Calculate accrued profit for active/scheduled(started) cycles
                if ((cycle.status === 'active' || cycle.status === 'scheduled') &&
                    cycle.startDate && cycle.endDate && cycle.targetProfitRate) {

                    const start = new Date(cycle.startDate).getTime();
                    const end = new Date(cycle.endDate).getTime();
                    const now = Date.now();

                    if (now > start && now < end) {
                        const progress = (now - start) / (end - start);
                        const totalTarget = (cycle.targetProfitRate / 100) * cycle.totalCapital;
                        currentProfit = totalTarget * progress;
                    } else if (now >= end) {
                        currentProfit = (cycle.targetProfitRate / 100) * cycle.totalCapital;
                    }
                }

                const cycleObj = cycle.toObject();
                cycleObj.currentProfit = currentProfit;
                return cycleObj;
            });

            res.json({
                success: true,
                count: cyclesWithProfit.length,
                data: cyclesWithProfit
            });
        } catch (error: any) {
            console.error("Error fetching cycles:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch cycles"
            });
        }
    }
    /**
     * ADMIN: Get trade cycle details
     * GET /api/gdip/admin/cycle/:cycleId
     */
    static async getCycleDetails(req: Request, res: Response) {
        try {
            const { cycleId } = req.params;
            const TradeCycle = require("../models/TradeCycle").default;

            const cycle = await TradeCycle.findOne({
                $or: [
                    { _id: cycleId },
                    { cycleId: cycleId }
                ]
            });

            if (!cycle) {
                return res.status(404).json({ error: "Trade cycle not found" });
            }

            res.json({
                success: true,
                data: cycle
            });
        } catch (error: any) {
            console.error("Error fetching cycle details:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch cycle details"
            });
        }
    }

    /**
     * Partner: Get the GDC currently in formation
     */
    static async getFormingGDC(req: Request, res: Response) {
        try {
            const gdc = await GDIPService.getFormingGDC();
            res.json({
                success: true,
                data: gdc
            });
        } catch (error: any) {
            console.error("Error fetching forming GDC:", error);
            res.status(500).json({
                error: error.message || "Failed to fetch forming GDC"
            });
        }
    }

    /**
     * Get all active commodity types
     */
    static async getCommodityTypes(req: Request, res: Response) {
        try {
            const types = await GDIPService.getCommodityTypes();
            res.json({
                success: true,
                data: types
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch commodity types"
            });
        }
    }

    /**
     * ADMIN: Create a new commodity type
     */
    static async createCommodityType(req: Request, res: Response) {
        try {
            const type = await GDIPService.createCommodityType(req.body);
            res.status(201).json({
                success: true,
                data: type
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to create commodity type"
            });
        }
    }

    /**
     * ADMIN: Update a commodity type
     */
    static async updateCommodityType(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const type = await GDIPService.updateCommodityType(id, req.body);
            if (!type) {
                return res.status(404).json({ success: false, message: "Commodity type not found" });
            }
            res.json({
                success: true,
                data: type
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to update commodity type"
            });
        }
    }

    /**
     * ADMIN: Delete a commodity type
     */
    static async deleteCommodityType(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await GDIPService.deleteCommodityType(id);
            res.json({
                success: true,
                message: "Commodity type deleted successfully"
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to delete commodity type"
            });
        }
    }

    /**
     * ADMIN: Initialize trade cycles for existing full GDCs
     * POST /api/gdip/admin/initialize-cycles
     */
    static async initializeCycles(req: Request, res: Response) {
        try {
            const GDC = require("../models/GDC").default;
            const TPIA = require("../models/TPIA").default;

            // Find all full GDCs without a current cycle
            const gdcsWithoutCycles = await GDC.find({
                isFull: true,
                $or: [
                    { currentCycleId: null },
                    { currentCycleId: { $exists: false } }
                ]
            });

            if (gdcsWithoutCycles.length === 0) {
                return res.json({
                    success: true,
                    message: "No GDCs found that need cycle initialization",
                    data: { cyclesCreated: 0, tpiasLinked: 0 }
                });
            }

            const results = {
                cyclesCreated: 0,
                tpiasLinked: 0,
                gdcsProcessed: [] as any[]
            };

            for (const gdc of gdcsWithoutCycles) {
                try {
                    // Get TPIAs for this GDC
                    const tpias = await TPIA.find({ gdcId: gdc._id });

                    if (tpias.length === 0) {
                        continue;
                    }

                    // Use the GDC's formedAt date as start, or current date if not available
                    const startDate = gdc.formedAt || new Date();

                    // Create trade cycle
                    const cycle = await TradeCycleService.createTradeCycle(
                        gdc._id,
                        tpias[0].commodityType || "Rice",
                        1000, // Default quantity
                        gdc.totalCapital,
                        startDate
                    );

                    results.cyclesCreated++;
                    results.tpiasLinked += tpias.length;
                    results.gdcsProcessed.push({
                        gdcId: gdc.gdcId,
                        gdcNumber: gdc.gdcNumber,
                        cycleId: cycle.cycleId,
                        tpiasLinked: tpias.length,
                        startDate: cycle.startDate
                    });

                } catch (error: any) {
                    console.error(`Error initializing cycle for GDC ${gdc.gdcNumber}:`, error);
                    // Continue with next GDC even if one fails
                }
            }

            res.json({
                success: true,
                message: `Successfully initialized ${results.cyclesCreated} trade cycles for ${results.tpiasLinked} TPIAs`,
                data: results
            });

        } catch (error: any) {
            console.error("Error initializing cycles:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to initialize cycles"
            });
        }
    }
}

export default GDIPController;
