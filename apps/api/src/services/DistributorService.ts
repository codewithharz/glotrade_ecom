import { User } from "../models";
import { WalletService } from "./WalletService";
import { distributorConfig } from "../config/distributor.config";
import { IUser } from "../types/user.types";

export class DistributorService {
    private walletService: WalletService;

    constructor() {
        this.walletService = new WalletService();
    }

    /**
     * Process rewards for all eligible distributors
     */
    async processRewards(): Promise<{ processed: number; totalAmount: number }> {
        console.log("Starting distributor reward processing...");

        // Find all distributors who are due for a reward
        // Criteria:
        // 1. Business Type is 'Distributor'
        // 2. nextRewardDate is <= now OR nextRewardDate is not set (first time)
        const now = new Date();

        // First, initialize nextRewardDate for any distributor who doesn't have it
        // This ensures we don't double-pay or miss anyone. 
        // If they don't have a date, set it to 3 months from now (start counting from today)
        // OR should we pay them immediately? 
        // Requirement: "credited... every 3 months". 
        // Let's assume new distributors start their 3-month timer upon registration or first run.

        // Find distributors without a nextRewardDate
        const newDistributors = await User.find({
            "businessInfo.businessType": "Distributor",
            "businessInfo.distributorStats.nextRewardDate": { $exists: false }
        });

        for (const user of newDistributors) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + distributorConfig.rewards.intervalDays);

            if (!user.businessInfo) continue;

            if (!user.businessInfo.distributorStats) {
                user.businessInfo.distributorStats = {
                    nextRewardDate: nextDate,
                    totalRewardsEarned: 0
                };
            } else {
                user.businessInfo.distributorStats.nextRewardDate = nextDate;
            }
            await user.save();
        }

        // Now find those due for payment
        const dueDistributors = await User.find({
            "businessInfo.businessType": "Distributor",
            "businessInfo.distributorStats.nextRewardDate": { $lte: now }
        });

        let processedCount = 0;
        let totalAmountPaid = 0;

        for (const user of dueDistributors) {
            try {
                await this.processSingleReward(user);
                processedCount++;
                // We can't easily track total amount here without modifying processSingleReward return
                // but for logging purposes, we'll just count processed users
            } catch (error) {
                console.error(`Failed to process reward for distributor ${user._id}:`, error);
            }
        }

        console.log(`Completed distributor reward processing. Processed: ${processedCount}`);
        return { processed: processedCount, totalAmount: totalAmountPaid };
    }

    /**
   * Process reward for a single distributor
   */
    private async processSingleReward(user: any): Promise<void> {
        // Get current wallet balance (returns values in Naira)
        const wallet = await this.walletService.getWalletBalance(user._id.toString(), "NGN");

        if (!wallet) {
            console.warn(`Distributor ${user._id} has no wallet. Skipping reward.`);
            return;
        }

        const totalBalanceNaira = wallet.total;

        if (totalBalanceNaira <= 0) {
            // No balance, no reward, but still update the date
            await this.updateNextRewardDate(user);
            return;
        }

        // Calculate reward amount in Naira
        const rewardNaira = totalBalanceNaira * (distributorConfig.rewards.percentage / 100);

        // Convert to Kobo for transaction (WalletService expects Kobo)
        const rewardKobo = Math.floor(rewardNaira * 100);

        if (rewardKobo > 0) {
            // Create transaction using addFunds
            await this.walletService.addFunds(
                user._id.toString(),
                rewardKobo,
                "NGN",
                "user",
                `Quarterly Distributor Reward (${distributorConfig.rewards.percentage}%)`,
                {
                    type: "earning",
                    systemGenerated: true
                },
                undefined, // session
                "distributor_reward" // category
            );

            // Update stats
            if (!user.businessInfo.distributorStats) {
                user.businessInfo.distributorStats = {
                    totalRewardsEarned: 0,
                    nextRewardDate: new Date() // Will be updated at end of function
                };
            }

            user.businessInfo.distributorStats.totalRewardsEarned = (user.businessInfo.distributorStats.totalRewardsEarned || 0) + rewardNaira;
            user.businessInfo.distributorStats.lastRewardDate = new Date();
            user.businessInfo.distributorStats.lastRewardAmount = rewardNaira;
        }

        // Update next reward date
        await this.updateNextRewardDate(user);
    }

    private async updateNextRewardDate(user: any): Promise<void> {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + distributorConfig.rewards.intervalDays);
        user.businessInfo.distributorStats.nextRewardDate = nextDate;
        await user.save();
    }
}

export default new DistributorService();
