// apps/api/src/routes/commission.routes.ts
import { Router } from "express";
import commissionController from "../controllers/commission.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/v1/commissions/summary
 * @desc    Get commission summary
 * @access  Private (Sales Agents only)
 */
router.get("/summary", commissionController.getCommissionSummary);

/**
 * @route   GET /api/v1/commissions/list
 * @desc    Get list of agent's commissions
 * @access  Private (Sales Agents only)
 * @query   page, limit, status, type, sortBy, sortOrder
 */
router.get("/list", commissionController.getMyCommissions);

/**
 * @route   GET /api/v1/commissions/:id
 * @desc    Get specific commission details
 * @access  Private (Sales Agents only)
 */
router.get("/:id", commissionController.getCommissionById);

/**
 * @route   POST /api/v1/commissions/:id/request-payment
 * @desc    Request commission payout
 * @access  Private (Sales Agents only)
 */
router.post("/:id/request-payment", commissionController.requestPayout);

/**
 * @route   POST /api/v1/commissions/request-payout
 * @desc    Request bulk payout for all approved commissions
 * @access  Private (Sales Agents only)
 */
router.post("/request-payout", commissionController.requestBulkPayout);

export default router;
