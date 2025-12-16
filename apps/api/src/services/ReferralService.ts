// apps/api/src/services/ReferralService.ts
import Referral, { IReferral } from "../models/Referral";
import User from "../models/User";
import { agentConfig, calculateAgentTier } from "../config/agent.config";
import { nanoid } from "nanoid";

export class ReferralService {
    /**
     * Generate a unique referral code for an agent
     */
    static async generateReferralCode(agentId: string): Promise<string> {
        const { prefix, length } = agentConfig.referralCode;
        let code: string;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            // Generate code like "AGENT-ABC123"
            const randomPart = nanoid(length).toUpperCase();
            code = `${prefix}-${randomPart}`;

            // Check if code already exists
            const existing = await User.findOne({ "businessInfo.referralCode": code });
            if (!existing) break;

            attempts++;
        } while (attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            throw new Error("Failed to generate unique referral code");
        }

        return code;
    }

    /**
     * Track a new referral when someone registers with a referral code
     */
    static async trackReferral(
        referralCode: string,
        referredUserId: string,
        metadata?: {
            source?: string;
            campaign?: string;
            ipAddress?: string;
            userAgent?: string;
        }
    ): Promise<IReferral> {
        // Find the agent by referral code
        const agent = await User.findOne({ "businessInfo.referralCode": referralCode });
        if (!agent) {
            throw new Error("Invalid referral code");
        }

        // Check if user is already referred
        const existingReferral = await Referral.findOne({ referredUserId });
        if (existingReferral) {
            throw new Error("User has already been referred");
        }

        // Prevent self-referral
        if (agent._id.toString() === referredUserId) {
            throw new Error("Cannot refer yourself");
        }

        // Create referral record
        const referral = await Referral.create({
            agentId: agent._id,
            referredUserId,
            referralCode,
            status: "pending", // Will become "active" after first purchase
            metadata: metadata || {},
        });

        // Update agent stats
        await this.updateAgentStats(agent._id.toString());

        return referral;
    }

    /**
     * Validate if a referral code exists and is active
     */
    static async validateReferralCode(code: string): Promise<boolean> {
        const agent = await User.findOne({
            "businessInfo.referralCode": code.toUpperCase(),
            "businessInfo.businessType": "Sales Agent",
        });
        return !!agent;
    }

    /**
     * Get referral statistics for an agent
     */
    static async getReferralStats(agentId: string) {
        const referrals = await Referral.find({ agentId });

        const totalReferrals = referrals.length;
        const activeReferrals = referrals.filter((r) => r.status === "active").length;
        const pendingReferrals = referrals.filter((r) => r.status === "pending").length;
        const totalOrders = referrals.reduce((sum, r) => sum + r.totalOrders, 0);
        const totalOrderValue = referrals.reduce((sum, r) => sum + r.totalOrderValue, 0);
        const totalCommission = referrals.reduce((sum, r) => sum + r.totalCommissionGenerated, 0);

        // Calculate conversion rate (pending -> active)
        const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

        // Calculate average order value
        const avgOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;

        return {
            totalReferrals,
            activeReferrals,
            pendingReferrals,
            totalOrders,
            totalOrderValue,
            totalCommission,
            conversionRate: Math.round(conversionRate * 100) / 100,
            avgOrderValue: Math.round(avgOrderValue),
        };
    }

    /**
     * Get paginated list of agent's referrals
     */
    static async getAgentReferrals(
        agentId: string,
        options: {
            page?: number;
            limit?: number;
            status?: "pending" | "active" | "inactive";
            sortBy?: "createdAt" | "totalOrders" | "totalOrderValue";
            sortOrder?: "asc" | "desc";
        } = {}
    ) {
        const {
            page = 1,
            limit = 20,
            status,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = options;

        const query: any = { agentId };
        if (status) query.status = status;

        const sort: any = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        const skip = (page - 1) * limit;

        const [referrals, total] = await Promise.all([
            Referral.find(query)
                .populate("referredUserId", "username email firstName lastName")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Referral.countDocuments(query),
        ]);

        return {
            referrals,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get specific referral details
     */
    static async getReferralById(referralId: string): Promise<IReferral | null> {
        return Referral.findById(referralId)
            .populate("agentId", "username email businessInfo")
            .populate("referredUserId", "username email firstName lastName");
    }

    /**
     * Update referral status when user makes first purchase
     */
    static async markReferralActive(referredUserId: string): Promise<void> {
        const referral = await Referral.findOne({ referredUserId });
        if (referral && referral.status === "pending") {
            referral.status = "active";
            referral.firstPurchaseAt = new Date();
            await referral.save();

            // Update agent stats
            await this.updateAgentStats(referral.agentId.toString());
        }
    }

    /**
     * Update referral metrics when referred user makes a purchase
     */
    static async updateReferralMetrics(
        referredUserId: string,
        orderValue: number,
        commission: number
    ): Promise<void> {
        const referral = await Referral.findOne({ referredUserId });
        if (!referral) return;

        // Store values in Naira (matches order format)
        referral.totalOrders += 1;
        referral.totalOrderValue += orderValue;
        referral.totalCommissionGenerated += commission;
        await referral.save();

        // Update agent stats
        await this.updateAgentStats(referral.agentId.toString());
    }

    /**
     * Update agent statistics (total referrals, tier, etc.)
     */
    static async updateAgentStats(agentId: string): Promise<void> {
        const stats = await this.getReferralStats(agentId);
        const tier = calculateAgentTier(stats.totalReferrals);

        await User.findByIdAndUpdate(agentId, {
            $set: {
                "businessInfo.agentStats.totalReferrals": stats.totalReferrals,
                "businessInfo.agentStats.activeReferrals": stats.activeReferrals,
                "businessInfo.agentStats.tier": tier,
            },
        });
    }

    /**
     * Get referral by referred user ID
     */
    static async getReferralByUserId(referredUserId: string): Promise<IReferral | null> {
        return Referral.findOne({ referredUserId });
    }
}

export default ReferralService;
