// apps/api/src/routes/admin/commission.routes.ts
import { Router } from "express";
import commissionController from "../../controllers/commission.controller";
import { requireAuth, requireAdmin } from "../../middleware/auth";

const router = Router();

// All routes require admin authentication
router.use(requireAuth);
router.use(requireAdmin);

/**
 * @route   PUT /api/v1/admin/commissions/:id/approve
 * @desc    Approve a commission
 * @access  Admin only
 */
router.put("/:id/approve", commissionController.approveCommission);

/**
 * @route   PUT /api/v1/admin/commissions/:id/reject
 * @desc    Reject a commission
 * @access  Admin only
 */
router.put("/:id/reject", commissionController.rejectCommission);

/**
 * @route   POST /api/v1/admin/commissions/:id/pay
 * @desc    Pay a commission
 * @access  Admin only
 */
router.post("/:id/pay", commissionController.payCommission);

export default router;
