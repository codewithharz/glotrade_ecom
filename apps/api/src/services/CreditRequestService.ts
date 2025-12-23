import mongoose from "mongoose";
import CreditRequest, { ICreditRequest } from "../models/CreditRequest";
import { WalletService } from "./WalletService";
import { NotificationService } from "./NotificationService";

export class CreditRequestService {
    private walletService: WalletService;
    private notificationService: NotificationService;

    constructor() {
        this.walletService = new WalletService();
        this.notificationService = new NotificationService();
    }

    /**
     * Submit a new credit request
     */
    async submitRequest(
        userId: string,
        requestedAmount: number, // in Naira
        businessReason: string,
        supportingDocuments?: string[]
    ): Promise<ICreditRequest> {
        // Check for existing pending request
        const existingPending = await CreditRequest.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            status: "pending"
        });

        if (existingPending) {
            throw new Error("You already have a pending credit request. Please wait for it to be reviewed.");
        }

        // Check request frequency (1 per 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRequest = await CreditRequest.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: thirtyDaysAgo }
        });

        if (recentRequest) {
            throw new Error("You can only submit one credit request per 30 days.");
        }

        // Validate amount range
        const minAmount = 50000; // ₦50,000
        const maxAmount = 10000000; // ₦10,000,000

        if (requestedAmount < minAmount || requestedAmount > maxAmount) {
            throw new Error(`Credit request must be between ₦${minAmount.toLocaleString()} and ₦${maxAmount.toLocaleString()}`);
        }

        // Create request
        const request = await CreditRequest.create({
            userId: new mongoose.Types.ObjectId(userId),
            requestedAmount,
            currency: "NGN",
            businessReason,
            supportingDocuments: supportingDocuments || [],
            status: "pending"
        });

        // Notify user
        await this.notificationService.createNotification({
            userId,
            type: "announcement",
            title: "Credit Request Submitted",
            message: `Your credit request for ₦${requestedAmount.toLocaleString()} has been submitted and is pending review.`,
            data: {
                requestId: request._id.toString(),
                amount: requestedAmount.toString()
            },
            priority: "medium"
        });

        // Notify admins (get all admin users)
        try {
            const { User } = require("../models");
            const admins = await User.find({ role: "admin" }).select("_id");

            for (const admin of admins) {
                await this.notificationService.createNotification({
                    userId: admin._id.toString(),
                    type: "announcement",
                    title: "New Credit Request",
                    message: `A new credit request for ₦${requestedAmount.toLocaleString()} has been submitted and requires review.`,
                    data: {
                        requestId: request._id.toString(),
                        userId,
                        amount: requestedAmount.toString()
                    },
                    priority: "high"
                });
            }
        } catch (error) {
            console.error("Failed to notify admins:", error);
        }

        return request;
    }

    /**
     * Get user's credit requests
     */
    async getUserRequests(userId: string): Promise<ICreditRequest[]> {
        return CreditRequest.find({
            userId: new mongoose.Types.ObjectId(userId)
        }).sort({ createdAt: -1 });
    }

    /**
     * Get all credit requests (admin)
     */
    async getAllRequests(filters?: {
        status?: string;
        startDate?: Date;
        endDate?: Date;
        minAmount?: number;
        maxAmount?: number;
        page?: number;
        limit?: number;
    }): Promise<{ requests: ICreditRequest[]; total: number; page: number; pages: number }> {
        const query: any = {};

        if (filters?.status) {
            query.status = filters.status;
        }

        if (filters?.startDate || filters?.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = filters.startDate;
            if (filters.endDate) query.createdAt.$lte = filters.endDate;
        }

        if (filters?.minAmount || filters?.maxAmount) {
            query.requestedAmount = {};
            if (filters.minAmount) query.requestedAmount.$gte = filters.minAmount;
            if (filters.maxAmount) query.requestedAmount.$lte = filters.maxAmount;
        }

        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const [requests, total] = await Promise.all([
            CreditRequest.find(query)
                .populate("userId", "username email phone")
                .populate("reviewedBy", "username")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            CreditRequest.countDocuments(query)
        ]);

        return {
            requests,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }

    /**
     * Get single request with user details
     */
    async getRequestById(requestId: string): Promise<ICreditRequest | null> {
        return CreditRequest.findById(requestId)
            .populate("userId", "username email phone createdAt")
            .populate("reviewedBy", "username");
    }

    /**
     * Approve credit request
     */
    async approveRequest(
        requestId: string,
        adminId: string,
        approvedAmount?: number, // in Naira, optional - defaults to requested amount
        adminNotes?: string
    ): Promise<ICreditRequest> {
        const request = await CreditRequest.findById(requestId);

        if (!request) {
            throw new Error("Credit request not found");
        }

        if (request.status !== "pending") {
            throw new Error("Only pending requests can be approved");
        }

        const finalAmount = approvedAmount || request.requestedAmount;

        // Update request status
        request.status = "approved";
        request.reviewedBy = adminId as any;
        request.reviewedAt = new Date();
        request.approvedAmount = finalAmount;
        request.adminNotes = adminNotes;
        await request.save();

        // Set credit limit in wallet
        await this.walletService.setCreditLimit(request.userId.toString(), finalAmount);

        // Notify user
        await this.notificationService.createNotification({
            userId: request.userId.toString(),
            type: "announcement",
            title: "Credit Request Approved",
            message: `Your credit request has been approved! You now have a credit limit of ₦${finalAmount.toLocaleString()}.`,
            data: {
                requestId: request._id.toString(),
                approvedAmount: finalAmount.toString(),
                adminNotes
            },
            priority: "high"
        });

        return request;
    }

    /**
     * Reject credit request
     */
    async rejectRequest(
        requestId: string,
        adminId: string,
        rejectionReason: string
    ): Promise<ICreditRequest> {
        const request = await CreditRequest.findById(requestId);

        if (!request) {
            throw new Error("Credit request not found");
        }

        if (request.status !== "pending") {
            throw new Error("Only pending requests can be rejected");
        }

        // Update request status
        request.status = "rejected";
        request.reviewedBy = adminId as any;
        request.reviewedAt = new Date();
        request.rejectionReason = rejectionReason;
        await request.save();

        // Notify user
        await this.notificationService.createNotification({
            userId: request.userId.toString(),
            type: "announcement",
            title: "Credit Request Rejected",
            message: `Your credit request for ₦${request.requestedAmount.toLocaleString()} has been rejected.`,
            data: {
                requestId: request._id.toString(),
                rejectionReason
            },
            priority: "high"
        });

        return request;
    }

    /**
     * Cancel credit request (by user)
     */
    async cancelRequest(requestId: string, userId: string): Promise<ICreditRequest> {
        const request = await CreditRequest.findById(requestId);

        if (!request) {
            throw new Error("Credit request not found");
        }

        if (request.userId.toString() !== userId) {
            throw new Error("Unauthorized");
        }

        if (request.status !== "pending") {
            throw new Error("Only pending requests can be cancelled");
        }

        request.status = "cancelled";
        await request.save();

        return request;
    }

    /**
     * Get user's order and payment history for admin review
     */
    async getUserHistory(userId: string): Promise<{
        totalOrders: number;
        completedOrders: number;
        totalSpent: number;
        averageOrderValue: number;
        walletBalance: number;
        creditUsed: number;
        creditLimit: number;
    }> {
        const { Order } = require("../models");

        // Get order statistics
        const orders = await Order.find({ buyer: userId });
        const completedOrders = orders.filter((o: any) => o.status === "delivered");
        const totalSpent = completedOrders.reduce((sum: number, o: any) => sum + o.totalPrice, 0);

        // Get wallet info
        const walletSummary = await this.walletService.getWalletSummary(userId, "user");

        return {
            totalOrders: orders.length,
            completedOrders: completedOrders.length,
            totalSpent: totalSpent, // Already in Naira
            averageOrderValue: completedOrders.length > 0 ? (totalSpent / completedOrders.length) : 0,
            walletBalance: walletSummary.ngnWallet.available,
            creditUsed: walletSummary.ngnWallet.creditUsed || 0,
            creditLimit: walletSummary.ngnWallet.creditLimit || 0
        };
    }
}
