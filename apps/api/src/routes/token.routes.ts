import { Router } from "express";
import { TokenController } from "../controllers/token.controller";
import { auth, requireRole } from "../middleware/auth";
import { UserService } from "../services/UserService";
import rateLimit from "express-rate-limit";

const router = Router();
const userService = new UserService();
const tokenController = new TokenController();

// Rate limiting for token operations
const stakingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many staking operations, please try again later",
});

// Admin operations rate limit
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: "Too many admin operations, please try again later",
});

// Public routes
router.get("/balance/:address", tokenController.getBalance);

// Protected routes
router.use(auth(userService));

// Staking routes (with rate limiting)
router.post("/:address/stake", stakingLimiter, tokenController.stake);
router.post("/:address/unstake", stakingLimiter, tokenController.unstake);
router.post(
  "/:address/emergency-unstake",
  stakingLimiter,
  tokenController.emergencyUnstake
);
router.get("/:address/rewards", tokenController.getRewards);

// Delegation routes
router.post("/:address/delegate", tokenController.delegate);
router.get("/:address/delegation-info", tokenController.getDelegationInfo);

// Vesting routes
router.get("/:address/vesting", tokenController.getVestingDetails);

// Admin only routes
router.use(requireRole(["admin"]));

// Token management routes
router.post("/:address/freeze", adminLimiter, tokenController.freezeAccount);
router.post(
  "/:address/unfreeze",
  adminLimiter,
  tokenController.unfreezeAccount
);
router.post(
  "/:address/set-multiplier",
  adminLimiter,
  tokenController.setRewardMultiplier
);

// Vesting management routes
router.post(
  "/:address/vesting/schedule",
  adminLimiter,
  tokenController.setVestingSchedule
);

export default router;
