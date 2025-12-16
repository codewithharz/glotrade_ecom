// apps/api/src/config/agent.config.ts
/**
 * Sales Agent System Configuration
 * 
 * IMPORTANT: All monetary values in this config are in NAIRA (not kobo)
 * This matches the order system format where totalPrice is stored in Naira.
 */

export const agentConfig = {
    commission: {
        // Registration bonus in Naira (default: ₦0)
        registrationBonus: parseInt(process.env.AGENT_REGISTRATION_BONUS || '0', 10),

        // Purchase commission percentage (default: 2%)
        purchaseCommissionPercent: parseFloat(process.env.AGENT_PURCHASE_COMMISSION_PERCENT || '2'),
    },

    tiers: {
        bronze: {
            min: parseInt(process.env.AGENT_TIER_BRONZE_MIN || '0', 10),
            max: parseInt(process.env.AGENT_TIER_BRONZE_MAX || '50', 10),
        },
        silver: {
            min: parseInt(process.env.AGENT_TIER_SILVER_MIN || '51', 10),
            max: parseInt(process.env.AGENT_TIER_SILVER_MAX || '100', 10),
        },
        gold: {
            min: parseInt(process.env.AGENT_TIER_GOLD_MIN || '101', 10),
            max: Infinity,
        },
    },

    approval: {
        // Enable auto-approval for commissions
        autoApprove: process.env.AGENT_AUTO_APPROVE_COMMISSIONS === 'true',

        // Max amount for auto-approval in NAIRA (default: ₦100,000)
        // NOTE: Changed from kobo to Naira to match order system!
        autoApproveMaxAmount: parseInt(process.env.AGENT_AUTO_APPROVE_MAX_AMOUNT || '100000', 10),
    },

    payout: {
        // Minimum payout amount in NAIRA (default: ₦100,000)
        minPayoutAmount: 100000, // Hardcoded to ensure 100k limit
    },

    fees: {
        // Registration fee in Naira (default: ₦0)
        registrationFee: parseInt(process.env.AGENT_REGISTRATION_FEE || '0', 10),

        // Monthly fee in Naira (default: ₦0)
        monthlyFee: parseInt(process.env.AGENT_MONTHLY_FEE || '0', 10),
    },

    referralCode: {
        prefix: 'AGENT',
        length: 6,
    },
};

/**
 * Calculate agent tier based on total referrals
 */
export function calculateAgentTier(totalReferrals: number): 'Bronze' | 'Silver' | 'Gold' {
    if (totalReferrals >= agentConfig.tiers.gold.min) {
        return 'Gold';
    }
    if (totalReferrals >= agentConfig.tiers.silver.min) {
        return 'Silver';
    }
    return 'Bronze';
}

/**
 * Check if commission should be auto-approved
 * @param amount Commission amount in NAIRA
 */
export function shouldAutoApproveCommission(amount: number): boolean {
    if (!agentConfig.approval.autoApprove) {
        return false;
    }
    return amount <= agentConfig.approval.autoApproveMaxAmount;
}

export default agentConfig;
