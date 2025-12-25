import cron from "node-cron";
import TradeCycleService from "../services/TradeCycleService";
import GDC from "../models/GDC";
import TradeCycle from "../models/TradeCycle";

/**
 * GDIP Cron Jobs - Automated trade cycle management
 * Runs every day at 2:00 AM to check for cycles that need processing
 */
export function initializeGDIPCronJobs() {
    console.log("🔄 Initializing GDIP automated trade cycle jobs...");

    /**
     * Daily job: Check for cycles ready to start
     * Runs at 2:00 AM every day
     */
    cron.schedule("0 2 * * *", async () => {
        console.log("⏰ [GDIP Cron] Checking for scheduled cycles to start...");

        try {
            const scheduledCycles = await TradeCycleService.getScheduledCycles();

            if (scheduledCycles.length === 0) {
                console.log("✅ [GDIP Cron] No scheduled cycles to start");
                return;
            }

            console.log(`📊 [GDIP Cron] Found ${scheduledCycles.length} cycles to start`);

            for (const cycle of scheduledCycles) {
                try {
                    await TradeCycleService.startCycle(cycle._id);
                    console.log(`✅ [GDIP Cron] Started cycle ${cycle.cycleId}`);
                } catch (error: any) {
                    console.error(`❌ [GDIP Cron] Failed to start cycle ${cycle.cycleId}:`, error.message);
                }
            }
        } catch (error: any) {
            console.error("❌ [GDIP Cron] Error checking scheduled cycles:", error.message);
        }
    });

    /**
     * Daily job: Check for cycles ready to complete
     * Runs at 3:00 AM every day
     */
    cron.schedule("0 3 * * *", async () => {
        console.log("⏰ [GDIP Cron] Checking for active cycles to complete...");

        try {
            const activeCycles = await TradeCycleService.getActiveCycles();

            if (activeCycles.length === 0) {
                console.log("✅ [GDIP Cron] No active cycles to complete");
                return;
            }

            console.log(`📊 [GDIP Cron] Found ${activeCycles.length} cycles to complete`);

            for (const cycle of activeCycles) {
                try {
                    // Auto-complete with target profit rate
                    await TradeCycleService.autoCompleteCycle(cycle._id);
                    console.log(`✅ [GDIP Cron] Auto-completed cycle ${cycle.cycleId} with ${cycle.targetProfitRate}% profit`);
                } catch (error: any) {
                    console.error(`❌ [GDIP Cron] Failed to complete cycle ${cycle.cycleId}:`, error.message);
                }
            }
        } catch (error: any) {
            console.error("❌ [GDIP Cron] Error checking active cycles:", error.message);
        }
    });

    /**
     * Daily job: Schedule new cycles for ready GDCs
     * Runs at 4:00 AM every day
     */
    cron.schedule("0 4 * * *", async () => {
        console.log("⏰ [GDIP Cron] Checking for GDCs ready for new cycles...");

        try {
            // Find GDCs that are ready and have no current cycle
            const readyGDCs = await GDC.find({
                status: "ready",
                isFull: true,
                currentCycleId: { $exists: false }
            });

            if (readyGDCs.length === 0) {
                console.log("✅ [GDIP Cron] No GDCs ready for new cycles");
                return;
            }

            console.log(`📊 [GDIP Cron] Found ${readyGDCs.length} GDCs ready for new cycles`);

            for (const gdc of readyGDCs) {
                try {
                    // Create new cycle starting in 1 day
                    const startDate = new Date();
                    startDate.setDate(startDate.getDate() + 1);

                    await TradeCycleService.createTradeCycle(
                        gdc._id,
                        gdc.primaryCommodity,
                        100, // Default commodity quantity
                        gdc.totalCapital * 0.95, // 95% of capital for commodity purchase
                        startDate
                    );

                    console.log(`✅ [GDIP Cron] Created new cycle for GDC-${gdc.gdcNumber}`);
                } catch (error: any) {
                    console.error(`❌ [GDIP Cron] Failed to create cycle for GDC-${gdc.gdcNumber}:`, error.message);
                }
            }
        } catch (error: any) {
            console.error("❌ [GDIP Cron] Error scheduling new cycles:", error.message);
        }
    });

    /**
     * Weekly job: Generate performance reports
     * Runs every Sunday at 1:00 AM
     */
    cron.schedule("0 1 * * 0", async () => {
        console.log("⏰ [GDIP Cron] Generating weekly performance reports...");

        try {
            const completedCycles = await TradeCycle.find({
                status: "completed",
                distributionDate: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            });

            if (completedCycles.length === 0) {
                console.log("✅ [GDIP Cron] No completed cycles in the last week");
                return;
            }

            const totalProfit = completedCycles.reduce((sum, c) => sum + c.totalProfitGenerated, 0);
            const avgROI = completedCycles.reduce((sum, c) => sum + c.roi, 0) / completedCycles.length;

            console.log(`📊 [GDIP Cron] Weekly Report:`);
            console.log(`   - Completed Cycles: ${completedCycles.length}`);
            console.log(`   - Total Profit: ₦${totalProfit.toLocaleString()}`);
            console.log(`   - Average ROI: ${avgROI.toFixed(2)}%`);

            // TODO: Send email reports to admins and partners
        } catch (error: any) {
            console.error("❌ [GDIP Cron] Error generating reports:", error.message);
        }
    });

    console.log("✅ GDIP cron jobs initialized successfully");
    console.log("   - Cycle start check: Daily at 2:00 AM");
    console.log("   - Cycle completion: Daily at 3:00 AM");
    console.log("   - New cycle scheduling: Daily at 4:00 AM");
    console.log("   - Weekly reports: Sundays at 1:00 AM");
}

export default initializeGDIPCronJobs;
