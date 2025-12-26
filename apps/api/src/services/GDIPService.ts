import TPIA from "../models/TPIA";
import GDC from "../models/GDC";
import TradeCycle from "../models/TradeCycle";
import Insurance from "../models/Insurance";
import Commodity from "../models/Commodity";
import Wallet from "../models/Wallet";
import WalletTransaction from "../models/WalletTransaction";
import User from "../models/User";
import CommodityType from "../models/CommodityType";
import { Schema } from "mongoose";
import TradeCycleService from "./TradeCycleService";

/**
 * GDIPService - Manages GDIP (Glotrade Distribution/Trusted Insured Partners) Platform
 * Handles TPIA creation, GDC management, and trade cycle orchestration
 */
export class GDIPService {

    /**
     * Get next available GDC number (increments by 10)
     */
    private static async getNextGDCNumber(): Promise<number> {
        const lastGDC = await GDC.findOne().sort({ gdcNumber: -1 }).limit(1);
        return lastGDC ? lastGDC.gdcNumber + 10 : 10;
    }

    /**
     * Get next available cycle number for a GDC
     */
    private static async getNextCycleNumber(gdcId: Schema.Types.ObjectId): Promise<number> {
        const lastCycle = await TradeCycle.findOne({ gdcId }).sort({ cycleNumber: -1 }).limit(1);
        return lastCycle ? lastCycle.cycleNumber + 1 : 1;
    }

    /**
     * Find or create an available GDC for new TPIA assignment
     */
    private static async findOrCreateAvailableGDC(commodityType: string): Promise<any> {
        // Look for ANY GDC that's not full, regardless of commodity type
        // Strict sequential filling: Sort by gdcNumber ASC to fill oldest first
        let gdc = await GDC.findOne({
            isFull: false,
            status: "forming"
        }).sort({ gdcNumber: 1 });

        // If no available GDC, create a new one
        if (!gdc) {
            const gdcNumber = await this.getNextGDCNumber();
            gdc = await GDC.create({
                gdcNumber,
                primaryCommodity: "Mixed", // GDC holds mixed commodities until Cycle determines trade
                capacity: 10,
                currentFill: 0,
                isFull: false,
                status: "forming",
                totalCapital: 0,
                totalProfitGenerated: 0,
                averageROI: 0,
                tpiaIds: [],
                tpiaNumbers: [],
                isActive: true
            });
        }

        return gdc;
    }

    /**
     * Bulk purchase TPIA blocks
     * @param partnerId - User ID of the partner
     * @param commodityType - Type of commodity
     * @param profitMode - TPM or EPS
     * @param quantity - Number of TPIAs to purchase (1-10)
     */
    static async purchaseBulk(
        partnerId: Schema.Types.ObjectId,
        commodityType: string,
        profitMode: "TPM" | "EPS" = "TPM",
        quantity: number = 1
    ): Promise<any[]> {
        if (quantity < 1 || quantity > 10) {
            throw new Error("Quantity must be between 1 and 10");
        }

        const unitPrice = 1000000;
        const totalPrice = unitPrice * quantity;

        // Get partner details
        const partner = await User.findById(partnerId);
        if (!partner) {
            throw new Error("Partner not found");
        }

        // Verify partner has sufficient funds
        const wallet = await Wallet.findOne({ userId: partnerId });
        if (!wallet || wallet.balance < totalPrice) {
            throw new Error(`Insufficient wallet balance. Required: ${totalPrice.toLocaleString()}`);
        }

        const purchasedTPIAs = [];

        // We process them one by one to ensure they fill GDCs correctly
        // but we deduct the total amount once or keep track of balance
        for (let i = 0; i < quantity; i++) {
            // Re-fetch GDC each time to ensure we fill sequentially
            const gdc = await this.findOrCreateAvailableGDC(commodityType);

            //TPIA numbers are now derived formulaically from the GDC cluster number and the slot position ((gdcNumber - 10) + slotPosition).
            // Formulaic numbering: (GDC-10 starting at 1, GDC-20 starting at 11, etc.)
            const tpiaNumber = (gdc.gdcNumber - 10) + (gdc.currentFill + 1);
            const positionInGDC = gdc.currentFill + 1;

            const tpia = await TPIA.create({
                tpiaNumber,
                partnerId,
                partnerName: partner.businessInfo?.companyName || `${partner.firstName} ${partner.lastName}`,
                partnerEmail: partner.email,
                gdcId: gdc._id,
                gdcNumber: gdc.gdcNumber,
                positionInGDC,
                purchasePrice: unitPrice,
                currentValue: unitPrice,
                totalProfitEarned: 0,
                compoundedValue: 0,
                cyclesCompleted: 0,
                profitMode,
                insuranceCoverageAmount: unitPrice,
                insuranceStatus: "pending",
                commodityType,
                commodityQuantity: 0,
                commodityUnit: "bags",
                status: "pending",
                purchasedAt: new Date(),
                documents: {}
            });

            // Update GDC
            gdc.tpiaIds.push(tpia._id);
            gdc.tpiaNumbers.push(tpiaNumber);
            gdc.currentFill += 1;
            gdc.totalCapital += unitPrice;

            if (gdc.currentFill === 10) {
                gdc.isFull = true;
                gdc.status = "ready";
                gdc.formedAt = new Date();
                gdc.nextCycleStartDate = new Date(Date.now() + 37 * 24 * 60 * 60 * 1000);

                // Auto-activate all TPIAs in this GDC
                await TPIA.updateMany(
                    { gdcId: gdc._id },
                    {
                        $set: {
                            status: "active",
                            activatedAt: new Date(),
                            insuranceStatus: "active"
                        }
                    }
                );

                // Auto-activate all Insurance records in this GDC
                await Insurance.updateMany(
                    { tpiaId: { $in: gdc.tpiaIds } },
                    { $set: { status: "active" } }
                );

                // Auto-create the first trade cycle for this GDC
                // This enables progress visualization immediately
                await TradeCycleService.createTradeCycle(
                    gdc._id,
                    commodityType,
                    1000, // Default quantity
                    gdc.totalCapital,
                    new Date() // Start immediately
                );
            }
            await gdc.save();

            // Create insurance record
            await Insurance.create({
                certificateNumber: tpia.insuranceCertificateNumber,
                tpiaId: tpia._id,
                tpiaNumber,
                provider: "Default Insurance Provider",
                policyType: "capital_protection",
                coverageAmount: unitPrice,
                deductible: 0,
                premium: unitPrice * 0.02,
                issueDate: new Date(),
                effectiveDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                status: "pending",
                partnerId,
                partnerName: tpia.partnerName
            });

            purchasedTPIAs.push(tpia);
        }

        // Deduct total from wallet
        wallet.balance -= totalPrice;
        wallet.totalSpent += totalPrice;
        await wallet.save();

        const bulkRef = `BULK-TPIA-${Date.now()}`;

        // Create one bulk wallet transaction
        await WalletTransaction.create({
            walletId: wallet._id,
            userId: partnerId,
            type: "payment",
            category: "order_payment",
            amount: totalPrice,
            currency: "NGN",
            balanceBefore: wallet.balance + totalPrice,
            balanceAfter: wallet.balance,
            status: "completed",
            reference: bulkRef,
            description: `Bulk purchase of ${quantity} TPIA blocks`,
            metadata: {
                quantity,
                unitPrice,
                tpiaIds: purchasedTPIAs.map(t => t._id.toString()),
                idempotencyKey: bulkRef
            },
            processedAt: new Date()
        });

        return purchasedTPIAs;
    }

    /**
     * Purchase a new TPIA block (deprecated in favor of bulk, but kept for compatibility)
     */
    static async purchaseTPIA(
        partnerId: Schema.Types.ObjectId,
        commodityType: string,
        profitMode: "TPM" | "EPS" = "TPM",
        purchasePrice: number = 1000000
    ): Promise<any> {
        const results = await this.purchaseBulk(partnerId, commodityType, profitMode, 1);
        return results[0];
    }

    /**
     * Get partner's TPIAs
     */
    static async getPartnerTPIAs(partnerId: Schema.Types.ObjectId): Promise<any[]> {
        const tpias = await TPIA.find({ partnerId }).populate("currentCycleId").sort({ tpiaNumber: 1 });

        // Calculate estimated accrued profit for each TPIA (same logic as portfolio)
        const tpiasWithEstimates = tpias.map(tpia => {
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

        return tpiasWithEstimates;
    }

    /**
     * Get TPIA details with related data
     */
    static async getTPIADetails(tpiaId: Schema.Types.ObjectId) {
        const tpia = await TPIA.findById(tpiaId);
        if (!tpia) {
            throw new Error("TPIA not found");
        }

        const [gdc, insurance, currentCycle] = await Promise.all([
            GDC.findById(tpia.gdcId),
            Insurance.findOne({ tpiaId }),
            tpia.currentCycleId ? TradeCycle.findById(tpia.currentCycleId) : null
        ]);

        // Calculate estimated profit
        let estimatedProfit = 0;
        if (currentCycle && currentCycle.startDate && currentCycle.endDate && currentCycle.targetProfitRate) {
            const start = new Date(currentCycle.startDate).getTime();
            const end = new Date(currentCycle.endDate).getTime();
            const now = Date.now();

            if (now > start && now < end) {
                const progress = (now - start) / (end - start);
                const totalTarget = (currentCycle.targetProfitRate / 100) * tpia.purchasePrice;
                estimatedProfit = totalTarget * progress;
            } else if (now >= end && currentCycle.status !== 'completed') {
                estimatedProfit = (currentCycle.targetProfitRate / 100) * tpia.purchasePrice;
            }
        }

        const tpiaObj = tpia.toObject();
        (tpiaObj as any).estimatedProfit = estimatedProfit;

        return {
            tpia: tpiaObj,
            gdc,
            insurance,
            currentCycle
        };
    }

    /**
     * Get GDC details with all TPIAs
     */
    static async getGDCDetails(gdcId: Schema.Types.ObjectId) {
        const gdc = await GDC.findById(gdcId);
        if (!gdc) {
            throw new Error("GDC not found");
        }

        const [tpias, cycles] = await Promise.all([
            TPIA.find({ gdcId }).sort({ positionInGDC: 1 }),
            TradeCycle.find({ gdcId }).sort({ cycleNumber: -1 }).limit(10)
        ]);

        // Calculate estimated profit from active or scheduled cycle (if started)
        const activeCycle = cycles.find((c: any) => c.status === "active" || c.status === "scheduled");
        let estimatedProfit = 0;

        if (activeCycle && activeCycle.startDate && activeCycle.endDate && activeCycle.targetProfitRate) {
            const start = new Date(activeCycle.startDate).getTime();
            const end = new Date(activeCycle.endDate).getTime();
            const now = Date.now();

            if (now > start && now < end) {
                const progress = (now - start) / (end - start);
                const totalTarget = (activeCycle.targetProfitRate / 100) * gdc.totalCapital;
                estimatedProfit = totalTarget * progress;
            } else if (now >= end) {
                estimatedProfit = (activeCycle.targetProfitRate / 100) * gdc.totalCapital;
            }
        }

        const gdcObj = gdc.toObject();
        gdcObj.totalProfitGenerated = (gdc.totalProfitGenerated || 0) + estimatedProfit;

        return {
            gdc: gdcObj,
            tpias,
            recentCycles: cycles
        };
    }

    /**
     * Switch TPIA profit mode (TPM <-> EPS)
     */
    static async switchProfitMode(
        tpiaId: Schema.Types.ObjectId,
        newMode: "TPM" | "EPS"
    ): Promise<any> {
        const tpia = await TPIA.findById(tpiaId);
        if (!tpia) {
            throw new Error("TPIA not found");
        }

        tpia.profitMode = newMode;
        await tpia.save();

        return tpia;
    }

    /**
     * Get partner's portfolio summary
     */
    static async getPartnerPortfolio(partnerId: Schema.Types.ObjectId) {
        const tpias = await TPIA.find({ partnerId }).populate("currentCycleId");

        // Calculate estimated accrued profit for each TPIA
        let totalEstimatedProfit = 0;
        const tpiasWithEstimates = tpias.map(tpia => {
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

            totalEstimatedProfit += estimatedProfit;
            return { ...tpia.toObject(), estimatedProfit };
        });

        const summary = {
            totalTPIAs: tpias.length,
            totalInvested: tpias.reduce((sum, t) => sum + t.purchasePrice, 0),
            currentValue: tpias.reduce((sum, t) => sum + t.currentValue, 0) + totalEstimatedProfit,
            totalProfitEarned: tpias.reduce((sum, t) => sum + t.totalProfitEarned, 0) + totalEstimatedProfit,
            estimatedAccruedProfit: totalEstimatedProfit,
            activeCycles: tpias.filter(t => t.currentCycleId).length,
            tpiasByStatus: {
                pending: tpias.filter(t => t.status === "pending").length,
                active: tpias.filter(t => t.status === "active").length,
                matured: tpias.filter(t => t.status === "matured").length,
                suspended: tpias.filter(t => t.status === "suspended").length
            },
            tpiasByMode: {
                TPM: tpias.filter(t => t.profitMode === "TPM").length,
                EPS: tpias.filter(t => t.profitMode === "EPS").length
            },
            gdcs: [...new Set(tpias.map(t => t.gdcNumber))].length
        };

        return {
            summary,
            tpias: tpiasWithEstimates
        };
    }

    /**
     * Get the current GDC in formation (for status visualization)
     */
    static async getFormingGDC(): Promise<any> {
        const GDC = require("../models/GDC").default;
        return await GDC.findOne({
            status: "forming",
            isFull: false
        }).sort({ gdcNumber: 1 });
    }

    /**
     * Get all active commodity types
     */
    static async getCommodityTypes(): Promise<any[]> {
        let types = await CommodityType.find({ isActive: true });

        // Auto-seed if empty
        if (types.length === 0) {
            await this.seedCommodityTypes();
            types = await CommodityType.find({ isActive: true });
        }

        return types;
    }

    /**
     * Seed initial commodity types
     */
    private static async seedCommodityTypes(): Promise<void> {
        const initialTypes = [
            { name: "Rice", label: "Rice", icon: "🌾" },
            { name: "Sugar", label: "Sugar", icon: "🍬" },
            { name: "Wheat", label: "Wheat", icon: "🌾" },
            { name: "Corn", label: "Corn", icon: "🌽" },
            { name: "Soybeans", label: "Soybeans", icon: "🫘" },
        ];

        for (const type of initialTypes) {
            await CommodityType.findOneAndUpdate(
                { name: type.name },
                { $set: type },
                { upsert: true, new: true }
            );
        }
    }

    /**
     * Create a new commodity type
     */
    static async createCommodityType(data: any): Promise<any> {
        return await CommodityType.create(data);
    }

    /**
     * Update an existing commodity type
     */
    static async updateCommodityType(id: string, data: any): Promise<any> {
        return await CommodityType.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
    }

    /**
     * Delete a commodity type (or deactivate it)
     */
    static async deleteCommodityType(id: string): Promise<any> {
        return await CommodityType.findByIdAndDelete(id);
    }
}

export default GDIPService;
