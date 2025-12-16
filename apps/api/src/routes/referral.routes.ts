// apps/api/src/routes/referral.routes.ts
import { Router } from "express";
import referralController from "../controllers/referral.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/v1/referrals/my-code
 * @desc    Get agent's referral code
 * @access  Private (Sales Agents only)
 */
router.get("/my-code", referralController.getMyReferralCode);

/**
 * @route   GET /api/v1/referrals/stats
 * @desc    Get referral statistics
 * @access  Private (Sales Agents only)
 */
router.get("/stats", referralController.getReferralStats);

/**
 * @route   GET /api/v1/referrals/list
 * @desc    Get list of agent's referrals
 * @access  Private (Sales Agents only)
 * @query   page, limit, status, sortBy, sortOrder
 */
router.get("/list", referralController.getMyReferrals);

/**
 * @route   POST /api/v1/referrals/validate/:code
 * @desc    Validate a referral code
 * @access  Public (but authenticated)
 */
router.post("/validate/:code", referralController.validateReferralCode);

/**
 * @route   GET /api/v1/referrals/:id
 * @desc    Get specific referral details
 * @access  Private (Sales Agents only)
 */
router.get("/:id", referralController.getReferralById);

export default router;
