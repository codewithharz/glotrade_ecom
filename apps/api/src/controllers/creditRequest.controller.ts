import { Request, Response, NextFunction } from "express";
import { CreditRequestService } from "../services/CreditRequestService";

class CreditRequestController {
    private service: CreditRequestService;

    constructor() {
        this.service = new CreditRequestService();
    }

    /**
     * Submit new credit request (wholesaler)
     */
    submitRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            const { requestedAmount, businessReason, supportingDocuments } = req.body;

            if (!userId) {
                return res.status(401).json({
                    status: "error",
                    message: "Unauthorized"
                });
            }

            if (!requestedAmount || !businessReason) {
                return res.status(400).json({
                    status: "error",
                    message: "Requested amount and business reason are required"
                });
            }

            // Convert Naira to kobo
            const amountInKobo = Math.round(requestedAmount * 100);

            const request = await this.service.submitRequest(
                userId,
                amountInKobo,
                businessReason,
                supportingDocuments
            );

            res.status(201).json({
                status: "success",
                data: request,
                message: "Credit request submitted successfully"
            });
        } catch (error: any) {
            if (error.message.includes("already have a pending") || error.message.includes("only submit one")) {
                return res.status(400).json({
                    status: "error",
                    message: error.message
                });
            }
            next(error);
        }
    };

    /**
     * Get user's credit requests
     */
    getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    status: "error",
                    message: "Unauthorized"
                });
            }

            const requests = await this.service.getUserRequests(userId);

            res.status(200).json({
                status: "success",
                data: requests
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get all credit requests (admin)
     */
    getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { status, startDate, endDate, minAmount, maxAmount, page, limit } = req.query;

            const filters: any = {};
            if (status) filters.status = status;
            if (startDate) filters.startDate = new Date(startDate as string);
            if (endDate) filters.endDate = new Date(endDate as string);
            if (minAmount) filters.minAmount = Number(minAmount) * 100; // Convert to kobo
            if (maxAmount) filters.maxAmount = Number(maxAmount) * 100; // Convert to kobo
            if (page) filters.page = Number(page);
            if (limit) filters.limit = Number(limit);

            const result = await this.service.getAllRequests(filters);

            res.status(200).json({
                status: "success",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get single request details (admin)
     */
    getRequestById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            const request = await this.service.getRequestById(id);

            if (!request) {
                return res.status(404).json({
                    status: "error",
                    message: "Credit request not found"
                });
            }

            // Get user history for admin review
            // request.userId is populated, so we need to cast it to access _id
            const userId = (request.userId as any)._id.toString();
            const userHistory = await this.service.getUserHistory(userId);

            res.status(200).json({
                status: "success",
                data: {
                    request,
                    userHistory
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Approve credit request (admin)
     */
    approveRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const adminId = (req as any).user?.id;
            const { approvedAmount, adminNotes } = req.body;

            if (!adminId) {
                return res.status(401).json({
                    status: "error",
                    message: "Unauthorized"
                });
            }

            // Convert approved amount to kobo if provided
            const amountInKobo = approvedAmount ? Math.round(approvedAmount * 100) : undefined;

            const request = await this.service.approveRequest(
                id,
                adminId,
                amountInKobo,
                adminNotes
            );

            res.status(200).json({
                status: "success",
                data: request,
                message: "Credit request approved successfully"
            });
        } catch (error: any) {
            if (error.message.includes("not found") || error.message.includes("Only pending")) {
                return res.status(400).json({
                    status: "error",
                    message: error.message
                });
            }
            next(error);
        }
    };

    /**
     * Reject credit request (admin)
     */
    rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const adminId = (req as any).user?.id;
            const { rejectionReason } = req.body;

            if (!adminId) {
                return res.status(401).json({
                    status: "error",
                    message: "Unauthorized"
                });
            }

            if (!rejectionReason) {
                return res.status(400).json({
                    status: "error",
                    message: "Rejection reason is required"
                });
            }

            const request = await this.service.rejectRequest(
                id,
                adminId,
                rejectionReason
            );

            res.status(200).json({
                status: "success",
                data: request,
                message: "Credit request rejected"
            });
        } catch (error: any) {
            if (error.message.includes("not found") || error.message.includes("Only pending")) {
                return res.status(400).json({
                    status: "error",
                    message: error.message
                });
            }
            next(error);
        }
    };

    /**
     * Cancel credit request (user)
     */
    cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    status: "error",
                    message: "Unauthorized"
                });
            }

            const request = await this.service.cancelRequest(id, userId);

            res.status(200).json({
                status: "success",
                data: request,
                message: "Credit request cancelled"
            });
        } catch (error: any) {
            if (error.message.includes("Unauthorized") || error.message.includes("Only pending")) {
                return res.status(400).json({
                    status: "error",
                    message: error.message
                });
            }
            next(error);
        }
    };
}

export default new CreditRequestController();
