// src/types/token.types.ts
import { Document, Model } from "mongoose";

export type StakingTier = "bronze" | "silver" | "gold" | "platinum";
export type VestingInterval = "daily" | "weekly" | "monthly";

export interface IVestingSchedule {
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  releasedAmount: number;
  interval: VestingInterval;
}

export interface ITokenBase {
  holder: string;
  balance: number;
  stakedAmount: number;
  stakingStartDate?: Date;
  lastRewardsClaim?: Date;
  totalRewardsClaimed: number;
  isVesting: boolean;
  vestingSchedule?: IVestingSchedule;
  lastTransactionBlock: number;
  transactionCount: number;
  stakingTier: StakingTier;
  rewardMultiplier: number;
  lockPeriodEnd?: Date;
  emergencyUnstakeEnabled: boolean;
  delegatedAmount: number;
  delegatedTo?: string;
  nonce: number;
  frozen: boolean;
  lastActivityDate: Date;
  totalPenalties?: number;
  lastEmergencyUnstake?: Date;
  emergencyUnstakeCount?: number;
}

export interface ITokenMethods {
  calculateStakingTier(): StakingTier;
  calculateRewardMultiplier(): number;
  canUnstake(): boolean;
}

export interface ITokenModel extends Model<IToken, {}, ITokenMethods> {
  findByHolder(address: string): Promise<IToken | null>;
}

export interface IToken extends ITokenBase, Document, ITokenMethods {}

// Response types for API endpoints
export interface TokenBalanceResponse {
  balance: number;
  stakedAmount: number;
  stakingTier: StakingTier;
  rewardMultiplier: number;
}

export interface StakingDetailsResponse {
  stakedAmount: number;
  stakingTier: StakingTier;
  rewardMultiplier: number;
  lockPeriodEnd?: Date;
  pendingRewards: number;
}

export interface DelegationDetailsResponse {
  delegatedAmount: number;
  delegatedTo?: string;
  earnings: number;
}
