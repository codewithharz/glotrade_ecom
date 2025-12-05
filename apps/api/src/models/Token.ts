// src/models/Token.ts
import mongoose, { Schema } from "mongoose";
import {
  IToken,
  ITokenModel,
  IVestingSchedule,
  StakingTier,
} from "../types/token.types";

const tokenSchema = new Schema<IToken>(
  {
    holder: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    stakedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    stakingStartDate: {
      type: Date,
    },
    lastRewardsClaim: {
      type: Date,
    },
    totalRewardsClaimed: {
      type: Number,
      default: 0,
      min: 0,
    },
    isVesting: {
      type: Boolean,
      default: false,
    },
    vestingSchedule: {
      startDate: Date,
      endDate: Date,
      totalAmount: Number,
      releasedAmount: {
        type: Number,
        default: 0,
      },
      interval: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
    },
    lastTransactionBlock: {
      type: Number,
      default: 0,
    },
    transactionCount: {
      type: Number,
      default: 0,
    },
    stakingTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    rewardMultiplier: {
      type: Number,
      default: 1,
    },
    lockPeriodEnd: Date,
    emergencyUnstakeEnabled: {
      type: Boolean,
      default: true,
    },
    delegatedAmount: {
      type: Number,
      default: 0,
    },
    delegatedTo: String,
    nonce: {
      type: Number,
      default: 0,
    },
    frozen: {
      type: Boolean,
      default: false,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    totalPenalties: {
      type: Number,
      default: 0,
    },
    lastEmergencyUnstake: {
      type: Date,
    },
    emergencyUnstakeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
tokenSchema.index({ stakingStartDate: 1 });
tokenSchema.index({
  "vestingSchedule.startDate": 1,
  "vestingSchedule.endDate": 1,
});

// Add methods
tokenSchema.methods.calculateStakingTier = function (): StakingTier {
  if (this.stakedAmount >= 10000) return "platinum";
  if (this.stakedAmount >= 5000) return "gold";
  if (this.stakedAmount >= 1000) return "silver";
  return "bronze";
};

tokenSchema.methods.calculateRewardMultiplier = function (): number {
  switch (this.stakingTier as StakingTier) {
    case "platinum":
      return 3;
    case "gold":
      return 2;
    case "silver":
      return 1.5;
    default:
      return 1;
  }
};

tokenSchema.methods.canUnstake = function (): boolean {
  return (
    !this.frozen && (!this.lockPeriodEnd || this.lockPeriodEnd <= new Date())
  );
};

// Pre-save middleware
tokenSchema.pre("save", async function (next) {
  if (this.isModified("balance") && this.balance < 0) {
    throw new Error("Balance cannot be negative");
  }
  if (this.isModified("stakedAmount") && this.stakedAmount > this.balance) {
    throw new Error("Cannot stake more than balance");
  }

  // Update staking tier and multiplier when staked amount changes
  if (this.isModified("stakedAmount")) {
    this.stakingTier = this.calculateStakingTier();
    this.rewardMultiplier = this.calculateRewardMultiplier();
  }

  next();
});

// Create and export model
const Token = mongoose.model<IToken, ITokenModel>("Token", tokenSchema);
export default Token;
