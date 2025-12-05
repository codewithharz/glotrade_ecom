// src/controllers/token.controller.ts
// Express types handled by any
import { BaseController } from "./BaseController";
import { IToken } from "../types/token.types";
import { TokenService } from "../services/TokenService";
import { ValidationError } from "../utils/errors";

export class TokenController extends BaseController<IToken> {
  private tokenService: TokenService;

  constructor() {
    const tokenService = new TokenService();
    super(tokenService);
    this.tokenService = tokenService;
  }

  getBalance = async (req: any, res: any, next: any) => {
    try {
      const { address } = req.params;
      const token = await this.tokenService.findOrCreateHoldings(address);
      const balanceInfo = await this.tokenService.getTokenBalance(address);

      res.status(200).json({
        status: "success",
        data: {
          ...balanceInfo,
          stakingTier: token.stakingTier,
          rewardMultiplier: token.rewardMultiplier,
          lockPeriodEnd: token.lockPeriodEnd,
          isStaking: token.stakedAmount > 0,
          isDelegating: token.delegatedAmount > 0,
          isFrozen: token.frozen,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  stake = async (req: any, res: any, next: any) => {
    try {
      const { address } = req.params;
      const { amount, lockPeriodDays } = req.body;

      if (!amount) {
        throw new ValidationError("Amount is required");
      }

      const token = await this.tokenService.stake(
        address,
        Number(amount),
        lockPeriodDays
      );
      const rewards = await this.tokenService.calculateRewards(address);

      res.status(200).json({
        status: "success",
        data: {
          balance: token.balance,
          stakedAmount: token.stakedAmount,
          stakingTier: token.stakingTier,
          rewardMultiplier: token.rewardMultiplier,
          lockPeriodEnd: token.lockPeriodEnd,
          stakingStartDate: token.stakingStartDate,
          projectedRewards: {
            daily: rewards.projectedDaily,
            monthly: rewards.projectedMonthly,
            yearly: rewards.projectedYearly,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  unstake = async (req: any, res: any, next: any) => {
    try {
      const { address } = req.params;
      const { amount } = req.body;

      if (!amount) {
        throw new ValidationError("Amount is required");
      }

      const token = await this.tokenService.unstake(address, Number(amount));

      res.status(200).json({
        status: "success",
        data: {
          balance: token.balance,
          stakedAmount: token.stakedAmount,
          stakingTier: token.stakingTier,
          remainingLockPeriod: token.lockPeriodEnd,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  emergencyUnstake = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { address } = req.params;
      const { amount } = req.body;

      if (!amount) {
        throw new ValidationError("Amount is required");
      }

      const result = await this.tokenService.unstake(
        address,
        Number(amount),
        true
      );

      res.status(200).json({
        status: "success",
        data: {
          balance: result.balance,
          stakedAmount: result.stakedAmount,
          stakingTier: result.stakingTier,
          penaltyApplied: true,
          penaltyAmount: result.penaltyAmount,
          message: `Emergency unstake completed with ${
            this.tokenService.getPenaltyRate() * 100
          }% penalty`,
          lockPeriodEnd: result.lockPeriodEnd,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getRewards = async (req: any, res: any, next: any) => {
    try {
      const { address } = req.params;
      const rewards = await this.tokenService.calculateRewards(address);
      const token = await this.tokenService.findOrCreateHoldings(address);

      res.status(200).json({
        status: "success",
        data: {
          ...rewards,
          stakingTier: token.stakingTier,
          totalRewardsClaimed: token.totalRewardsClaimed,
          lastRewardsClaim: token.lastRewardsClaim,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  claimRewards = async (req: any, res: any, next: any) => {
    try {
      const { address } = req.params;
      const result = await this.tokenService.claimRewards(address);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  delegate = async (req: any, res: any, next: any) => {
    try {
      const { address } = req.params;
      const { toAddress, amount } = req.body;

      if (!toAddress || !amount) {
        throw new ValidationError("Recipient address and amount are required");
      }

      if (address.toLowerCase() === toAddress.toLowerCase()) {
        throw new ValidationError("Cannot delegate to self");
      }

      const token = await this.tokenService.delegate(
        address,
        toAddress,
        Number(amount)
      );

      res.status(200).json({
        status: "success",
        data: {
          delegatedAmount: token.delegatedAmount,
          delegatedTo: token.delegatedTo,
          balance: token.balance,
          transactionCount: token.transactionCount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getDelegationInfo = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { address } = req.params;
      const token = await this.tokenService.findOrCreateHoldings(address);

      res.status(200).json({
        status: "success",
        data: {
          delegatedAmount: token.delegatedAmount,
          delegatedTo: token.delegatedTo,
          isDelegating: token.delegatedAmount > 0,
          lastActivityDate: token.lastActivityDate,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getAccountActivity = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { address } = req.params;
      const token = await this.tokenService.findOrCreateHoldings(address);

      res.status(200).json({
        status: "success",
        data: {
          transactionCount: token.transactionCount,
          lastActivityDate: token.lastActivityDate,
          lastTransactionBlock: token.lastTransactionBlock,
          nonce: token.nonce,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin-only operations
  freezeAccount = async (req: any, res: any, next: any) => {
    try {
      const { address } = req.params;
      const { reason } = req.body;

      if (!reason) {
        throw new ValidationError("Freeze reason is required");
      }

      const token = await this.tokenService.freezeAccount(address);

      res.status(200).json({
        status: "success",
        data: {
          address: token.holder,
          frozen: token.frozen,
          reason,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  unfreezeAccount = async (req: any, res: any, next: any) => {
    try {
      const { address } = req.params;
      const token = await this.tokenService.unfreezeAccount(address);

      res.status(200).json({
        status: "success",
        data: {
          address: token.holder,
          frozen: token.frozen,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  setRewardMultiplier = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { address } = req.params;
      const { multiplier } = req.body;

      if (!multiplier || multiplier < 1 || multiplier > 3) {
        throw new ValidationError(
          "Invalid multiplier value (must be between 1 and 3)"
        );
      }

      const token = await this.tokenService.findOrCreateHoldings(address);
      token.rewardMultiplier = multiplier;
      await token.save();

      res.status(200).json({
        status: "success",
        data: {
          address: token.holder,
          newMultiplier: token.rewardMultiplier,
          stakingTier: token.stakingTier,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getAccountStatus = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { address } = req.params;
      const token = await this.tokenService.findOrCreateHoldings(address);

      res.status(200).json({
        status: "success",
        data: {
          holder: token.holder,
          balance: token.balance,
          stakedAmount: token.stakedAmount,
          delegatedAmount: token.delegatedAmount,
          stakingTier: token.stakingTier,
          rewardMultiplier: token.rewardMultiplier,
          isStaking: token.stakedAmount > 0,
          isDelegating: token.delegatedAmount > 0,
          isFrozen: token.frozen,
          lockPeriodEnd: token.lockPeriodEnd,
          lastActivityDate: token.lastActivityDate,
          transactionCount: token.transactionCount,
          emergencyUnstakeEnabled: token.emergencyUnstakeEnabled,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getVestingDetails = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { address } = req.params;
      const token = await this.tokenService.findOrCreateHoldings(address);

      if (!token.isVesting || !token.vestingSchedule) {
        return res.status(200).json({
          status: "success",
          data: {
            isVesting: false,
            message: "No vesting schedule found for this address",
          },
        });
      }

      const now = new Date();
      const schedule = token.vestingSchedule;
      let vestedAmount = 0;
      let nextVestingDate = null;
      let remainingAmount = 0;
      let intervalInMs = 0;

      // Define interval durations in milliseconds
      const INTERVAL_MS = {
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000,
        monthly: 30 * 24 * 60 * 60 * 1000,
      };

      if (now >= schedule.endDate) {
        vestedAmount = schedule.totalAmount;
        remainingAmount = 0;
      } else if (now > schedule.startDate) {
        const totalDuration =
          schedule.endDate.getTime() - schedule.startDate.getTime();
        const elapsed = now.getTime() - schedule.startDate.getTime();
        vestedAmount = Math.floor(
          (schedule.totalAmount * elapsed) / totalDuration
        );
        remainingAmount = schedule.totalAmount - vestedAmount;

        // Get interval duration based on schedule interval
        intervalInMs = INTERVAL_MS[schedule.interval];

        // Calculate next vesting date
        nextVestingDate = new Date(now.getTime() + intervalInMs);
        if (nextVestingDate > schedule.endDate) {
          nextVestingDate = schedule.endDate;
        }
      }

      res.status(200).json({
        status: "success",
        data: {
          isVesting: true,
          schedule: {
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            totalAmount: schedule.totalAmount,
            interval: schedule.interval,
          },
          progress: {
            vestedAmount,
            releasedAmount: schedule.releasedAmount,
            remainingAmount,
            claimableAmount: vestedAmount - schedule.releasedAmount,
          },
          nextVesting: {
            date: nextVestingDate,
            estimatedAmount:
              remainingAmount > 0
                ? Math.floor(
                    schedule.totalAmount /
                      ((schedule.endDate.getTime() -
                        schedule.startDate.getTime()) /
                        intervalInMs)
                  )
                : 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  setVestingSchedule = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { address } = req.params;
      const { startDate, endDate, totalAmount, interval } = req.body;

      // Validate inputs
      if (!startDate || !endDate || !totalAmount || !interval) {
        throw new ValidationError("Missing required vesting parameters");
      }

      if (!["daily", "weekly", "monthly"].includes(interval)) {
        throw new ValidationError("Invalid vesting interval");
      }

      const token = await this.tokenService.findOrCreateHoldings(address);

      // Update vesting schedule
      token.isVesting = true;
      token.vestingSchedule = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount: Number(totalAmount),
        releasedAmount: 0,
        interval,
      };

      await token.save();

      res.status(200).json({
        status: "success",
        data: {
          holder: token.holder,
          vestingSchedule: token.vestingSchedule,
          message: "Vesting schedule set successfully",
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

// // Express types handled by any
// import { BaseController } from "./BaseController";
// import { Token } from "../models";
// import { IToken } from "../models/Token";
// import { TokenService } from "../services/TokenService";
// import { ValidationError } from "../utils/errors";

// export class TokenController extends BaseController<IToken> {
//   private tokenService: TokenService;

//   constructor() {
//     const tokenService = new TokenService();
//     super(tokenService);
//     this.tokenService = tokenService;
//   }

//   // Get token balance for an address
//   getBalance = async (req: any, res: any, next: any) => {
//     try {
//       const { address } = req.params;
//       const token = await this.tokenService.findOrCreateHoldings(address);

//       res.status(200).json({
//         status: "success",
//         data: {
//           balance: token?.balance || 0,
//           stakedAmount: token?.stakedAmount || 0,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   // Stake tokens
//   stake = async (req: any, res: any, next: any) => {
//     try {
//       const { address } = req.params;
//       const { amount } = req.body;

//       if (!amount) {
//         throw new ValidationError("Amount is required");
//       }

//       const token = await this.tokenService.stake(address, Number(amount));

//       res.status(200).json({
//         status: "success",
//         data: {
//           balance: token.balance,
//           stakedAmount: token.stakedAmount,
//           stakingStartDate: token.stakingStartDate,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   // Unstake tokens
//   unstake = async (req: any, res: any, next: any) => {
//     try {
//       const { address } = req.params;
//       const { amount } = req.body;

//       if (!amount) {
//         throw new ValidationError("Amount is required");
//       }

//       const token = await this.tokenService.unstake(address, Number(amount));

//       res.status(200).json({
//         status: "success",
//         data: {
//           balance: token.balance,
//           stakedAmount: token.stakedAmount,
//           stakingStartDate: token.stakingStartDate,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   // Get staking rewards
//   getRewards = async (req: any, res: any, next: any) => {
//     try {
//       const { address } = req.params;
//       const token = await this.tokenService.findOrCreateHoldings(address);
//       const rewards = await this.tokenService.calculateRewards(address);

//       res.status(200).json({
//         status: "success",
//         data: {
//           pendingRewards: rewards,
//           totalRewardsClaimed: token.totalRewardsClaimed,
//           stakedAmount: token.stakedAmount,
//           stakingStartDate: token.stakingStartDate,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   // Get vesting schedule details
//   getVestingDetails = async (
//     req: any,
//     res: any,
//     next: any
//   ) => {
//     try {
//       const { address } = req.params;
//       const details = await this.tokenService.getVestingDetails(address);

//       if (!details) {
//         return res.status(200).json({
//           status: "success",
//           data: {
//             isVesting: false,
//             message: "No vesting schedule found for this address",
//           },
//         });
//       }

//       res.status(200).json({
//         status: "success",
//         data: details,
//       });
//     } catch (error) {
//       next(error);
//     }
//   };
// }
