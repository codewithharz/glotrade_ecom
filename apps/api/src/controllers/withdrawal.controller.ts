import { Request, Response, NextFunction } from "express";
import { WalletService } from "../services/WalletService";
import WithdrawalRequest from "../models/WithdrawalRequest";

export class WithdrawalController {
    private walletService: WalletService;

    constructor() {
        this.walletService = new WalletService();
    }

    // Request withdrawal (User)
    requestWithdrawal = async (req: any, res: Response, next: NextFunction) => {
        try {
            console.log("Withdrawal request - req.user:", req.user);
            const userId = req.user?._id;
            const { amount, bankDetails } = req.body;

            if (!userId) {
                console.log("No userId found in req.user");
                return res.status(401).json({ status: "error", message: "Unauthorized" });
            }

            if (!amount || amount <= 0) {
                return res.status(400).json({ status: "error", message: "Invalid amount" });
            }

            if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankCode) {
                return res.status(400).json({ status: "error", message: "Invalid bank details" });
            }

            const withdrawal = await this.walletService.requestWithdrawal(
                userId,
                amount,
                bankDetails
            );

            return res.status(201).json({
                status: "success",
                message: "Withdrawal request submitted successfully",
                data: withdrawal
            });
        } catch (error: any) {
            next(error);
        }
    };

    // Get withdrawal history (User)
    getHistory = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;
            const { page = 1, limit = 20, status } = req.query;

            if (!userId) {
                return res.status(401).json({ status: "error", message: "Unauthorized" });
            }

            const query: any = { userId };
            if (status) query.status = status;

            const requests = await WithdrawalRequest.find(query)
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));

            const total = await WithdrawalRequest.countDocuments(query);

            return res.status(200).json({
                status: "success",
                data: requests,
                meta: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        } catch (error: any) {
            next(error);
        }
    };

    // Get all withdrawals (Admin)
    getAllWithdrawals = async (req: any, res: Response, next: NextFunction) => {
        try {
            const { page = 1, limit = 20, status, userId } = req.query;

            const query: any = {};
            if (status) query.status = status;
            if (userId) query.userId = userId;

            const requests = await WithdrawalRequest.find(query)
                .populate("userId", "firstName lastName email")
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));

            const total = await WithdrawalRequest.countDocuments(query);

            return res.status(200).json({
                status: "success",
                data: requests,
                meta: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        } catch (error: any) {
            next(error);
        }
    };

    // Approve withdrawal (Admin)
    approveWithdrawal = async (req: any, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const adminId = req.user?._id;

            const withdrawal = await this.walletService.approveWithdrawal(id, adminId);

            return res.status(200).json({
                status: "success",
                message: "Withdrawal approved",
                data: withdrawal
            });
        } catch (error: any) {
            next(error);
        }
    };

    // Reject withdrawal (Admin)
    rejectWithdrawal = async (req: any, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const adminId = req.user?._id;

            if (!reason) {
                return res.status(400).json({ status: "error", message: "Rejection reason is required" });
            }

            const withdrawal = await this.walletService.rejectWithdrawal(id, adminId, reason);

            return res.status(200).json({
                status: "success",
                message: "Withdrawal rejected",
                data: withdrawal
            });
        } catch (error: any) {
            next(error);
        }
    };

    getBanks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const banks = await this.walletService.listBanks();

            // Add test bank at the top for development
            const banksWithTest = [
                { name: "TEST BANK (Use account: 0123456789)", code: "001" },
                ...banks
            ];

            return res.status(200).json({
                status: "success",
                data: banksWithTest
            });
        } catch (error: any) {
            next(error);
        }
    };

    resolveAccount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { accountNumber, bankCode } = req.query;

            if (!accountNumber || !bankCode) {
                return res.status(400).json({
                    status: "error",
                    message: "Account number and bank code are required"
                });
            }

            // Handle test account without calling API
            if (bankCode === "001" && accountNumber === "0123456789") {
                return res.status(200).json({
                    status: "success",
                    data: {
                        accountName: "TEST ACCOUNT NAME"
                    }
                });
            }

            try {
                const account = await this.walletService.resolveAccount(
                    accountNumber as string,
                    bankCode as string
                );

                return res.status(200).json({
                    status: "success",
                    data: account
                });
            } catch (error: any) {
                // Handle Paystack test mode limit gracefully
                if (error.message && error.message.includes("Test mode daily limit")) {
                    console.warn("Paystack test mode limit reached, returning mock data");
                    return res.status(200).json({
                        status: "success",
                        data: {
                            accountName: "TEST ACCOUNT (Limit Reached)"
                        }
                    });
                }
                throw error;
            }
        } catch (error: any) {
            console.error("Error resolving account:", error);
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to resolve account"
            });
        }
    };
}
