/**
 * Distributor System Configuration
 */

export const distributorConfig = {
    rewards: {
        // Percentage of wallet balance to reward (default: 2%)
        percentage: parseFloat(process.env.DISTRIBUTOR_REWARD_PERCENT || '2'),

        // Interval in days for rewards (default: 90 days)
        intervalDays: parseInt(process.env.DISTRIBUTOR_REWARD_INTERVAL_DAYS || '90', 10),
    }
};

export default distributorConfig;
