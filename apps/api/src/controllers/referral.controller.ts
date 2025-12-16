// apps/api/src/controllers/referral.controller.ts
import { Request, Response, NextFunction } from "express";
import ReferralService from "../services/ReferralService";
import { ValidationError } from "../utils/errors";

export class ReferralController {
    /**
     * Get agent's referral code
     */
    async getMyReferralCode(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new ValidationError("Unauthorized");

            const User = require("../models/User").default;
            const user = await User.findById(userId);

            if (!user || user.businessInfo?.businessType !== "Sales Agent") {
                throw new ValidationError("Only Sales Agents can access referral codes");
            }

            const referralCode = user.businessInfo?.referralCode;
            if (!referralCode) {
                throw new ValidationError("Referral code not found. Please contact support.");
            }

            res.json({
                status: "success",
                data: {
                    referralCode,
                    agentStats: user.businessInfo?.agentStats || {},
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get referral statistics
     */
    async getReferralStats(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new ValidationError("Unauthorized");

            const stats = await ReferralService.getReferralStats(userId);

            res.json({
                status: "success",
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get list of agent's referrals
     */
    async getMyReferrals(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new ValidationError("Unauthorized");

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const status = req.query.status as "pending" | "active" | "inactive" | undefined;
            const sortBy = (req.query.sortBy as string) || "createdAt";
            const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

            const result = await ReferralService.getAgentReferrals(userId, {
                page,
                limit,
                status,
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
     * Validate a referral code
     */
    async validateReferralCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { code } = req.params;
            if (!code) throw new ValidationError("Referral code is required");

            const isValid = await ReferralService.validateReferralCode(code);

            res.json({
                status: "success",
                data: {
                    valid: isValid,
                    code: code.toUpperCase(),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get specific referral details
     */
    async getReferralById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            const { id } = req.params;

            if (!userId) throw new ValidationError("Unauthorized");
            if (!id) throw new ValidationError("Referral ID is required");

            const referral = await ReferralService.getReferralById(id);
            if (!referral) throw new ValidationError("Referral not found");

            // Ensure user owns this referral
            if (referral.agentId.toString() !== userId) {
                throw new ValidationError("Unauthorized to view this referral");
            }

            res.json({
                status: "success",
                data: referral,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ReferralController();
