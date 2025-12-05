// src/services/TokenService.ts
import { BaseService } from "./BaseService";
import { Token } from "../models";
import { IToken, StakingTier } from "../types/token.types";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";


interface UnstakeResult {
  balance: number;
  stakedAmount: number;
  stakingTier: StakingTier;
  penaltyApplied?: boolean;
  penaltyAmount?: number;
  rewardMultiplier: number;
  lockPeriodEnd?: Date;
}

export class TokenService extends BaseService<IToken> {
  constructor() {
    super(Token);
  }

  private TIER_LIMITS = {
    bronze: 0,
    silver: 1000,
    gold: 5000,
    platinum: 10000,
  };

  private REWARDS_CONFIG = {
    baseAPY: 0.12, // 12% base APY
    multipliers: {
      bronze: 1,
      silver: 1.5,
      gold: 2,
      platinum: 3,
    },
    emergencyUnstakePenalty: 0.1, // 10% penalty
    minLockPeriod: 7, // 7 days
    maxLockPeriod: 365, // 365 days
  };

  // Add getter method for penalty rate
  getPenaltyRate(): number {
    return this.REWARDS_CONFIG.emergencyUnstakePenalty;
  }

  async findOrCreateHoldings(address: string): Promise<IToken> {


    const normalizedAddress = address.toLowerCase();
    let token = await this.model.findOne({ holder: normalizedAddress });

    if (!token) {
      token = await this.model.create({
        holder: normalizedAddress,
        balance: 1000, // Initial token balance
        stakedAmount: 0,
        totalRewardsClaimed: 0,
        isVesting: false,
        lastTransactionBlock: 0,
        transactionCount: 0,
        stakingTier: "bronze",
        rewardMultiplier: 1,
        delegatedAmount: 0,
        nonce: 0,
        frozen: false,
        emergencyUnstakeEnabled: true,
        lastActivityDate: new Date(),
      });
    }

    return token;
  }

  async getTokenBalance(address: string): Promise<{
    available: number;
    staked: number;
    delegated: number;
    total: number;
  }> {
    const token = await this.findOrCreateHoldings(address);
    return {
      available: token.balance,
      staked: token.stakedAmount,
      delegated: token.delegatedAmount,
      total: token.balance + token.stakedAmount + token.delegatedAmount,
    };
  }

  async stake(
    address: string,
    amount: number,
    lockPeriodDays?: number
  ): Promise<IToken> {
    const token = await this.findOrCreateHoldings(address);

    // Validations
    if (token.frozen) {
      throw new UnauthorizedError("Account is frozen");
    }

    if (amount <= 0) {
      throw new ValidationError("Stake amount must be positive");
    }

    if (token.balance < amount) {
      throw new ValidationError(
        `Insufficient balance. Available: ${token.balance} ATH`
      );
    }

    if (lockPeriodDays) {
      if (lockPeriodDays < this.REWARDS_CONFIG.minLockPeriod) {
        throw new ValidationError(
          `Minimum lock period is ${this.REWARDS_CONFIG.minLockPeriod} days`
        );
      }
      if (lockPeriodDays > this.REWARDS_CONFIG.maxLockPeriod) {
        throw new ValidationError(
          `Maximum lock period is ${this.REWARDS_CONFIG.maxLockPeriod} days`
        );
      }
      token.lockPeriodEnd = new Date(
        Date.now() + lockPeriodDays * 24 * 60 * 60 * 1000
      );
    }

    // Process stake
    token.balance -= amount;
    token.stakedAmount += amount;
    token.stakingStartDate = token.stakingStartDate || new Date();
    token.transactionCount += 1;
    token.lastActivityDate = new Date();

    // Update staking tier
    const newTotal = token.stakedAmount;
    if (newTotal >= this.TIER_LIMITS.platinum) {
      token.stakingTier = "platinum";
      token.rewardMultiplier = this.REWARDS_CONFIG.multipliers.platinum;
    } else if (newTotal >= this.TIER_LIMITS.gold) {
      token.stakingTier = "gold";
      token.rewardMultiplier = this.REWARDS_CONFIG.multipliers.gold;
    } else if (newTotal >= this.TIER_LIMITS.silver) {
      token.stakingTier = "silver";
      token.rewardMultiplier = this.REWARDS_CONFIG.multipliers.silver;
    }

    return token.save();
  }

  async unstake(
    address: string,
    amount: number,
    emergency: boolean = false
  ): Promise<UnstakeResult> {
    const token = await this.findOrCreateHoldings(address);

    // Validations
    if (token.frozen) {
      throw new UnauthorizedError("Account is frozen");
    }

    if (!emergency && token.lockPeriodEnd && token.lockPeriodEnd > new Date()) {
      throw new ValidationError(
        `Tokens are locked until ${token.lockPeriodEnd}`
      );
    }

    if (amount <= 0) {
      throw new ValidationError("Unstake amount must be positive");
    }

    if (token.stakedAmount < amount) {
      throw new ValidationError(
        `Insufficient staked amount. Staked: ${token.stakedAmount} ATH`
      );
    }

    // Calculate unstake amount and penalty
    let unstakeAmount = amount;
    let penaltyAmount = 0;

    if (emergency) {
      if (!token.emergencyUnstakeEnabled) {
        throw new ValidationError("Emergency unstake is disabled");
      }
      penaltyAmount = amount * this.REWARDS_CONFIG.emergencyUnstakePenalty;
      unstakeAmount = amount - penaltyAmount;
    }

    // Process unstake
    token.balance += unstakeAmount;
    token.stakedAmount -= amount;
    token.transactionCount += 1;
    token.lastActivityDate = new Date();

    // Track penalty in a new field
    if (emergency) {
      token.totalPenalties = (token.totalPenalties || 0) + penaltyAmount;
    }

    // Reset staking if fully unstaked
    if (token.stakedAmount === 0) {
      token.stakingStartDate = undefined;
      token.lockPeriodEnd = undefined;
      token.stakingTier = "bronze";
      token.rewardMultiplier = this.REWARDS_CONFIG.multipliers.bronze;
    }

    await token.save();

    return {
      balance: token.balance,
      stakedAmount: token.stakedAmount,
      stakingTier: token.stakingTier,
      rewardMultiplier: token.rewardMultiplier,
      lockPeriodEnd: token.lockPeriodEnd,
      ...(emergency && {
        penaltyApplied: true,
        penaltyAmount,
      }),
    };
  }

  async calculateRewards(address: string): Promise<{
    pendingRewards: number;
    projectedDaily: number;
    projectedMonthly: number;
    projectedYearly: number;
    multiplier: number;
  }> {
    const token = await this.findOrCreateHoldings(address);

    if (!token.stakedAmount || !token.stakingStartDate) {
      return {
        pendingRewards: 0,
        projectedDaily: 0,
        projectedMonthly: 0,
        projectedYearly: 0,
        multiplier: token.rewardMultiplier,
      };
    }

    const now = new Date();
    const stakingDuration = now.getTime() - token.stakingStartDate.getTime();
    const daysStaked = stakingDuration / (1000 * 60 * 60 * 24);

    const annualRate = this.REWARDS_CONFIG.baseAPY * token.rewardMultiplier;
    const pendingRewards = (token.stakedAmount * annualRate * daysStaked) / 365;
    const projectedDaily = (token.stakedAmount * annualRate) / 365;
    const projectedMonthly = projectedDaily * 30;
    const projectedYearly = token.stakedAmount * annualRate;

    return {
      pendingRewards,
      projectedDaily,
      projectedMonthly,
      projectedYearly,
      multiplier: token.rewardMultiplier,
    };
  }

  async claimRewards(address: string): Promise<{
    claimedAmount: number;
    newBalance: number;
  }> {
    const token = await this.findOrCreateHoldings(address);

    if (token.frozen) {
      throw new UnauthorizedError("Account is frozen");
    }

    const { pendingRewards } = await this.calculateRewards(address);

    if (pendingRewards <= 0) {
      throw new ValidationError("No rewards available to claim");
    }

    token.balance += pendingRewards;
    token.totalRewardsClaimed += pendingRewards;
    token.lastRewardsClaim = new Date();
    token.lastActivityDate = new Date();
    token.transactionCount += 1;

    await token.save();

    return {
      claimedAmount: pendingRewards,
      newBalance: token.balance,
    };
  }

  async delegate(
    from: string,
    to: string,
    amount: number
  ): Promise<{
    delegatedAmount: number;
    delegatedTo: string;
    balance: number;
    transactionCount: number;
  }> {
    const [fromToken, toToken] = await Promise.all([
      this.findOrCreateHoldings(from),
      this.findOrCreateHoldings(to),
    ]);

    // Validations
    if (fromToken.frozen || toToken.frozen) {
      throw new UnauthorizedError("One of the accounts is frozen");
    }

    if (amount <= 0) {
      throw new ValidationError("Delegation amount must be positive");
    }

    if (fromToken.balance < amount) {
      throw new ValidationError("Insufficient balance for delegation");
    }

    // Process delegation
    fromToken.balance -= amount;
    fromToken.delegatedAmount += amount;
    fromToken.delegatedTo = to;
    fromToken.transactionCount += 1;
    fromToken.lastActivityDate = new Date();

    await fromToken.save();
    await toToken.save();

    return {
      delegatedAmount: fromToken.delegatedAmount,
      delegatedTo: fromToken.delegatedTo,
      balance: fromToken.balance,
      transactionCount: fromToken.transactionCount,
    };
  }

  async freezeAccount(address: string): Promise<IToken> {
    const token = await this.findOrCreateHoldings(address);
    token.frozen = true;
    token.lastActivityDate = new Date();
    return token.save();
  }

  async unfreezeAccount(address: string): Promise<IToken> {
    const token = await this.findOrCreateHoldings(address);
    token.frozen = false;
    token.lastActivityDate = new Date();
    return token.save();
  }
}

// // src/services/TokenService.ts
// import { BaseService } from "./BaseService";
// import { Token } from "../models";
// import { IToken } from "../models/Token";
// import { ValidationError } from "../utils/errors";
// import { isEthereumAddress } from "../utils/validators";

// export class TokenService extends BaseService<IToken> {
//   constructor() {
//     super(Token);
//   }

//   async findOrCreateHoldings(address: string): Promise<IToken> {
//     if (!isEthereumAddress(address)) {
//       throw new ValidationError("Invalid Ethereum address");
//     }

//     const normalizedAddress = address.toLowerCase();
//     let token = await this.model.findOne({ holder: normalizedAddress });

//     if (!token) {
//       // Initialize with default values
//       token = await this.model.create({
//         holder: normalizedAddress,
//         balance: 1000, // Initial token balance for testing
//         stakedAmount: 0,
//         totalRewardsClaimed: 0,
//         isVesting: false
//       });
//     }

//     return token;
//   }

//   async stake(address: string, amount: number): Promise<IToken> {
//     const token = await this.findOrCreateHoldings(address);
//     if (!token) {
//       throw new ValidationError("No token holdings found for this address");
//     }

//     if (amount <= 0) {
//       throw new ValidationError("Stake amount must be positive");
//     }

//     if (token.balance < amount) {
//       throw new ValidationError("Insufficient balance for staking");
//     }

//     token.balance -= amount;
//     token.stakedAmount += amount;
//     token.stakingStartDate = token.stakingStartDate || new Date();

//     return token.save();
//   }

//   async unstake(address: string, amount: number): Promise<IToken> {
//     const token = await this.findOrCreateHoldings(address);
//     if (!token) {
//       throw new ValidationError("No token holdings found for this address");
//     }

//     if (amount <= 0) {
//       throw new ValidationError("Unstake amount must be positive");
//     }

//     if (token.stakedAmount < amount) {
//       throw new ValidationError("Insufficient staked amount");
//     }

//     token.balance += amount;
//     token.stakedAmount -= amount;

//     if (token.stakedAmount === 0) {
//       token.stakingStartDate = undefined;
//     }

//     return token.save();
//   }

//   async calculateRewards(address: string): Promise<number> {
//     const token = await this.findOrCreateHoldings(address);
//     if (!token || !token.stakedAmount || !token.stakingStartDate) {
//       return 0;
//     }

//     const now = new Date();
//     const stakingDuration = now.getTime() - token.stakingStartDate.getTime();
//     const daysStaked = stakingDuration / (1000 * 60 * 60 * 24);

//     // 12% APY calculation
//     return (token.stakedAmount * 0.12 * daysStaked) / 365;
//   }

//   async claimRewards(address: string): Promise<IToken> {
//     const token = await this.findOrCreateHoldings(address);
//     if (!token) {
//       throw new ValidationError("No token holdings found for this address");
//     }

//     const rewards = await this.calculateRewards(address);
//     if (rewards <= 0) {
//       throw new ValidationError("No rewards available to claim");
//     }

//     token.balance += rewards;
//     token.totalRewardsClaimed += rewards;
//     token.lastRewardsClaim = new Date();

//     return token.save();
//   }

//   async getVestingDetails(address: string): Promise<{
//     schedule: any;
//     vestedAmount: number;
//     claimableAmount: number;
//   }> {
//     const token = await this.findOrCreateHoldings(address);
//     if (!token || !token.isVesting || !token.vestingSchedule) {
//       throw new ValidationError("No vesting schedule found for this address");
//     }

//     const now = new Date();
//     const schedule = token.vestingSchedule;

//     let vestedAmount = 0;
//     if (now >= schedule.endDate) {
//       vestedAmount = schedule.totalAmount;
//     } else if (now > schedule.startDate) {
//       const totalDuration =
//         schedule.endDate.getTime() - schedule.startDate.getTime();
//       const elapsed = now.getTime() - schedule.startDate.getTime();
//       vestedAmount = (schedule.totalAmount * elapsed) / totalDuration;
//     }

//     const claimableAmount = vestedAmount - schedule.releasedAmount;

//     return {
//       schedule: token.vestingSchedule,
//       vestedAmount,
//       claimableAmount,
//     };
//   }
// }
