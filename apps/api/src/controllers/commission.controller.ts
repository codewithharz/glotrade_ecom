// apps/api/src/controllers/commission.controller.ts
import { Request, Response, NextFunction } from "express";
import CommissionService from "../services/CommissionService";
import { ValidationError } from "../utils/errors";

export class CommissionController {
    /**
     * Get commission summary for agent
     */
    async getCommissionSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new ValidationError("Unauthorized");

            // Verify user is a Sales Agent
            const User = (await import("../models/User")).default;
            const user = await User.findById(userId);

            if (!user || user.businessInfo?.businessType !== "Sales Agent") {
                throw new ValidationError("Access denied: User is not a Sales Agent");
            }

            const summary = await CommissionService.getCommissionSummary(userId);

            res.json({
                status: "success",
                data: summary,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get list of agent's commissions
     */
    async getMyCommissions(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new ValidationError("Unauthorized");

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const status = req.query.status as "pending" | "approved" | "paid" | "rejected" | undefined;
            const type = req.query.type as "registration" | "purchase" | "bonus" | "tier_upgrade" | undefined;
            const sortBy = (req.query.sortBy as string) || "calculatedAt";
            const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

            const result = await CommissionService.getAgentCommissions(userId, {
                page,
                limit,
                status,
                type,
                sortBy: sortBy as any,
                sortOrder,
            });

            res.json({
                status: "success",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get specific commission details
     */
    async getCommissionById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            const { id } = req.params;

            if (!userId) throw new ValidationError("Unauthorized");
            if (!id) throw new ValidationError("Commission ID is required");

            const commission = await CommissionService.getCommissionById(id);
            if (!commission) throw new ValidationError("Commission not found");

            // Ensure user owns this commission
            if (commission.agentId.toString() !== userId) {
                throw new ValidationError("Unauthorized to view this commission");
            }

            res.json({
                status: "success",
                data: commission,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Request commission payout (agent action)
     */
    async requestPayout(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            const { id } = req.params;

            if (!userId) throw new ValidationError("Unauthorized");
            if (!id) throw new ValidationError("Commission ID is required");

            const commission = await CommissionService.getCommissionById(id);
            if (!commission) throw new ValidationError("Commission not found");

            // Ensure user owns this commission
            if (commission.agentId.toString() !== userId) {
                throw new ValidationError("Unauthorized");
            }

            const paidCommission = await CommissionService.requestPayout(id);

            res.json({
                status: "success",
                message: "Commission payout processed successfully",
                data: paidCommission,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Request bulk payout for all approved commissions
     */
    async requestBulkPayout(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new ValidationError("Unauthorized");

            const result = await CommissionService.requestBulkPayout(userId);

            res.json({
                status: "success",
                message: `Successfully processed payout for ${result.count} commissions totaling ₦${result.totalAmount}`,
                data: result,
            });
        } catch (error: any) {
            // Handle business logic errors (like insufficient funds) as 400 Bad Request
            if (error.message && (
                error.message.includes("less than minimum payout") ||
                error.message.includes("No approved commissions")
            )) {
                res.status(400).json({
                    status: "error",
                    message: error.message
                });
                return;
            }
            next(error);
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    /**
     * Approve commission (admin only)
     */
    async approveCommission(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = (req as any).user?.id;
            const { id } = req.params;

            if (!adminId) throw new ValidationError("Unauthorized");
            if (!id) throw new ValidationError("Commission ID is required");

            const commission = await CommissionService.approveCommission(id, adminId);

            res.json({
                status: "success",
                message: "Commission approved successfully",
                data: commission,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reject commission (admin only)
     */
    async rejectCommission(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = (req as any).user?.id;
            const { id } = req.params;
            const { reason } = req.body;

            if (!adminId) throw new ValidationError("Unauthorized");
            if (!id) throw new ValidationError("Commission ID is required");
            if (!reason) throw new ValidationError("Rejection reason is required");

            const commission = await CommissionService.rejectCommission(id, adminId, reason);

            res.json({
                status: "success",
                message: "Commission rejected",
                data: commission,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Pay commission (admin only)
     */
    async payCommission(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = (req as any).user?.id;
            const { id } = req.params;

            if (!adminId) throw new ValidationError("Unauthorized");
            if (!id) throw new ValidationError("Commission ID is required");

            const commission = await CommissionService.payCommission(id);

            res.json({
                status: "success",
                message: "Commission paid successfully",
                data: commission,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new CommissionController();
