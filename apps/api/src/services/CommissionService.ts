// apps/api/src/services/CommissionService.ts
import Commission, { ICommission } from "../models/Commission";
import Wallet from "../models/Wallet";
import WalletTransaction from "../models/WalletTransaction";
import User from "../models/User";
import ReferralService from "./ReferralService";
import { agentConfig, shouldAutoApproveCommission } from "../config/agent.config";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

export class CommissionService {
    /**
     * Calculate and create registration commission when a referred user registers
     */
    static async calculateRegistrationCommission(referralId: string): Promise<ICommission | null> {
        const { registrationBonus } = agentConfig.commission;

        // Skip if no registration bonus configured
        if (registrationBonus === 0) {
            return null;
        }

        const referral = await ReferralService.getReferralById(referralId);
        if (!referral) {
            throw new Error("Referral not found");
        }

        // Check if registration commission already exists
        const existing = await Commission.findOne({
            referralId,
            type: "registration",
        });
        if (existing) {
            return existing; // Already awarded
        }

        // Create commission record
        const commission = await Commission.create({
            agentId: referral.agentId,
            referralId,
            type: "registration",
            amount: registrationBonus,
            status: "pending", // Always start as pending
            description: `Registration bonus for referring user`,
            metadata: {
                autoApproved: false,
            },
        });

        // Check cumulative threshold
        await this.checkAndApproveCommissions(referral.agentId.toString());

        return commission;
    }

    /**
     * Calculate and create purchase commission when a referred user completes an order
     */
    /**
     * Calculate and create purchase commission when a referred user completes an order
     */
    static async calculatePurchaseCommission(
        orderId: string,
        referredUserId: string,
        _orderValue: number // Deprecated, calculated from line items
    ): Promise<ICommission | null> {
        // Get referral
        const referral = await ReferralService.getReferralByUserId(referredUserId);
        if (!referral) {
            return null; // User was not referred
        }

        // Check if commission already exists for this order
        const existing = await Commission.findOne({ orderId });
        if (existing) {
            return existing; // Already awarded
        }

        // Fetch full order with line items to get discounts
        const Order = mongoose.model("Order");
        const order: any = await Order.findById(orderId).lean();
        if (!order) {
            throw new Error("Order not found");
        }

        // Calculate commission amount based on product discounts
        // Commission = Sum of (Item Price * Quantity * Discount %)
        let totalCommission = 0;
        let totalOrderValue = 0;

        if (order.lineItems && Array.isArray(order.lineItems)) {
            for (const item of order.lineItems) {
                const itemTotal = item.unitPrice * item.qty;
                totalOrderValue += itemTotal;

                // If item has a discount, that discount % is the commission %
                if (item.discount && item.discount > 0) {
                    const itemCommission = (itemTotal * item.discount) / 100;
                    totalCommission += itemCommission;
                }
            }
        }

        // Round commission to nearest whole number (Naira)
        totalCommission = Math.round(totalCommission);

        // If no commission earned (no discounted items), return null
        if (totalCommission <= 0) {
            return null;
        }

        // Create commission record
        const commission = await Commission.create({
            agentId: referral.agentId,
            referralId: referral._id,
            orderId,
            type: "purchase",
            amount: totalCommission,
            status: "pending", // Always start as pending
            description: `Commission from discounted products in order #${orderId.slice(-6)}`,
            metadata: {
                orderValue: totalOrderValue,
                autoApproved: false,
                calculationMethod: "discount_based"
            },
        });

        // Update referral metrics
        await ReferralService.updateReferralMetrics(referredUserId, totalOrderValue, totalCommission);

        // Mark referral as active if this is first purchase
        await ReferralService.markReferralActive(referredUserId);

        // Check cumulative threshold
        await this.checkAndApproveCommissions(referral.agentId.toString());

        return commission;
    }

    /**
     * Approve a commission (admin action)
     */
    static async approveCommission(
        commissionId: string,
        approvedBy: string
    ): Promise<ICommission> {
        const commission = await Commission.findById(commissionId);
        if (!commission) {
            throw new Error("Commission not found");
        }

        if (commission.status !== "pending") {
            throw new Error(`Commission is already ${commission.status}`);
        }

        commission.status = "approved";
        commission.approvedAt = new Date();
        commission.approvedBy = approvedBy as any;
        await commission.save();

        return commission;
    }

    /**
     * Reject a commission (admin action)
     */
    static async rejectCommission(
        commissionId: string,
        rejectedBy: string,
        reason: string
    ): Promise<ICommission> {
        const commission = await Commission.findById(commissionId);
        if (!commission) {
            throw new Error("Commission not found");
        }

        if (commission.status !== "pending") {
            throw new Error(`Commission is already ${commission.status}`);
        }

        commission.status = "rejected";
        commission.rejectedAt = new Date();
        commission.rejectedBy = rejectedBy as any;
        commission.rejectionReason = reason;
        await commission.save();

        return commission;
    }

    /**
     * Pay commission to agent's wallet
     */
    static async payCommission(commissionId: string, session?: mongoose.ClientSession): Promise<ICommission> {
        const commission = await Commission.findById(commissionId).session(session || null);
        if (!commission) {
            throw new Error("Commission not found");
        }

        if (commission.status !== "approved") {
            throw new Error("Commission must be approved before payment");
        }

        // Get or create agent's wallet
        let wallet = await Wallet.findOne({ userId: commission.agentId }).session(session || null);
        if (!wallet) {
            wallet = (await Wallet.create([{
                userId: commission.agentId,
                type: "user",
                currency: "NGN",
                balance: 0,
            }], { session: session || null }))[0];
        }

        // Calculate new balances
        const balanceBefore = wallet.balance;
        const balanceAfter = balanceBefore + commission.amount;

        // Create wallet transaction
        const reference = `COMM-${nanoid(10).toUpperCase()}`;
        await WalletTransaction.create([{
            walletId: wallet._id,
            userId: commission.agentId,
            type: "commission",
            category: commission.type === "registration" ? "registration_bonus" : "commission",
            amount: commission.amount,
            currency: "NGN",
            balanceBefore,
            balanceAfter,
            status: "completed",
            reference,
            description: commission.description,
            metadata: {
                commissionId: commission._id.toString(),
                referralId: commission.referralId.toString(),
                commissionType: commission.type,
                idempotencyKey: `payout-${commission._id.toString()}`
            },
            processedAt: new Date(),
        }], { session: session || null });

        // Update wallet balances
        wallet.balance = balanceAfter;
        wallet.totalCommissionEarned += commission.amount;
        wallet.paidCommission += commission.amount;
        wallet.pendingCommission = Math.max(0, wallet.pendingCommission - commission.amount);
        await wallet.save({ session: session || null });

        // Update commission status
        commission.status = "paid";
        commission.paidAt = new Date();
        commission.metadata.paymentReference = reference;
        await commission.save({ session: session || null });

        // Update agent stats
        await User.findByIdAndUpdate(commission.agentId, {
            $inc: {
                "businessInfo.agentStats.totalCommissionEarned": commission.amount,
                "businessInfo.agentStats.pendingCommission": -commission.amount,
            },
        }).session(session || null);

        return commission;
    }

    /**
     * Get commission summary for an agent
     */
    static async getCommissionSummary(agentId: string) {
        const commissions = await Commission.find({ agentId });

        const totalEarned = commissions
            .filter((c) => c.status === "paid")
            .reduce((sum, c) => sum + c.amount, 0);

        const pending = commissions
            .filter((c) => c.status === "pending")
            .reduce((sum, c) => sum + c.amount, 0);

        // Approved is commissions that reached threshold and are ready for payout request
        const approved = commissions
            .filter((c) => c.status === "approved" && !c.metadata?.withdrawalId)
            .reduce((sum, c) => sum + c.amount, 0);

        // Payout Pending is commissions that have an active withdrawal request awaiting admin approval
        const payoutPending = commissions
            .filter((c) => c.status === "approved" && c.metadata?.withdrawalId)
            .reduce((sum, c) => sum + c.amount, 0);

        const rejected = commissions
            .filter((c) => c.status === "rejected")
            .reduce((sum, c) => sum + c.amount, 0);

        const byType = {
            registration: commissions
                .filter((c) => c.type === "registration" && c.status === "paid")
                .reduce((sum, c) => sum + c.amount, 0),
            purchase: commissions
                .filter((c) => c.type === "purchase" && c.status === "paid")
                .reduce((sum, c) => sum + c.amount, 0),
            bonus: commissions
                .filter((c) => c.type === "bonus" && c.status === "paid")
                .reduce((sum, c) => sum + c.amount, 0),
        };

        return {
            totalEarned,
            pending,
            approved,
            payoutPending,
            rejected,
            byType,
            totalCommissions: commissions.length,
        };
    }

    /**
     * Get paginated list of agent's commissions
     */
    static async getAgentCommissions(
        agentId: string,
        options: {
            page?: number;
            limit?: number;
            status?: "pending" | "approved" | "paid" | "rejected";
            type?: "registration" | "purchase" | "bonus" | "tier_upgrade";
            sortBy?: "calculatedAt" | "amount";
            sortOrder?: "asc" | "desc";
        } = {}
    ) {
        const {
            page = 1,
            limit = 50,
            status,
            type,
            sortBy = "calculatedAt",
            sortOrder = "desc",
        } = options;

        const query: any = { agentId };
        if (status) query.status = status;
        if (type) query.type = type;

        const sort: any = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        const skip = (page - 1) * limit;

        const [commissions, total] = await Promise.all([
            Commission.find(query)
                .populate("referralId", "referredUserId totalOrders")
                .populate("orderId", "orderId totalAmount")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Commission.countDocuments(query),
        ]);

        return {
            commissions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get commission by ID
     */
    static async getCommissionById(commissionId: string): Promise<ICommission | null> {
        return Commission.findById(commissionId)
            .populate("agentId", "username email businessInfo")
            .populate("referralId")
            .populate("orderId");
    }

    /**
     * Request commission payout (agent action)
     */
    static async requestPayout(commissionId: string): Promise<ICommission> {
        const commission = await Commission.findById(commissionId);
        if (!commission) {
            throw new Error("Commission not found");
        }

        if (commission.status !== "approved") {
            throw new Error("Only approved commissions can be paid out");
        }

        // Check minimum payout amount
        const { minPayoutAmount } = agentConfig.payout;
        if (commission.amount < minPayoutAmount) {
            throw new Error(`Minimum payout amount is ₦${minPayoutAmount.toLocaleString()}`);
        }

        // Pay the commission
        return this.payCommission(commissionId);
    }

    /**
     * Request payout for all approved commissions (bulk)
     */
    static async requestBulkPayout(agentId: string): Promise<{ count: number; totalAmount: number; withdrawalId: string }> {
        // Find all approved commissions for this agent
        const commissions = await Commission.find({
            agentId,
            status: "approved"
        });

        if (commissions.length === 0) {
            throw new Error("No approved commissions found for payout");
        }

        // Calculate total amount
        const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);

        // Check minimum payout amount (Config is in Naira)
        const minPayoutAmount = agentConfig.payout.minPayoutAmount;

        if (totalAmount < minPayoutAmount) {
            throw new Error(
                `Total approved amount (₦${totalAmount.toLocaleString()}) is less than minimum payout (₦${minPayoutAmount.toLocaleString()})`
            );
        }

        // Get agent's bank info from user model
        const user = await User.findById(agentId);
        if (!user || user.businessInfo?.businessType !== "Sales Agent") {
            throw new Error("Only Sales Agents can request commission payouts");
        }

        const bankAccount = user.bankAccount;
        if (!bankAccount || !bankAccount.accountNumber) {
            throw new Error("Please update your bank details in your profile before requesting payout");
        }

        // Create WithdrawalRequest
        const WithdrawalRequest = mongoose.model("WithdrawalRequest");
        const withdrawal = await WithdrawalRequest.create({
            userId: agentId,
            amount: totalAmount,
            currency: "NGN",
            bankDetails: {
                bankName: bankAccount.bankName,
                accountNumber: bankAccount.accountNumber,
                accountName: bankAccount.accountName || user.displayName,
                bankCode: bankAccount.bankCode
            },
            status: "pending",
            reference: `COMM-WDR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            metadata: {
                commissionIds: commissions.map(c => c._id.toString()),
                type: "commission_payout"
            }
        });

        // Optionally mark commissions as "processing" to prevent double payout requests
        await Commission.updateMany(
            { _id: { $in: commissions.map(c => c._id) } },
            { $set: { status: "approved", "metadata.withdrawalId": withdrawal._id } }
            // Note: Keeping them as 'approved' but tagging with withdrawalId.
            // Alternatively, we could add a 'payout_pending' status.
        );

        return {
            count: commissions.length,
            totalAmount,
            withdrawalId: withdrawal._id.toString()
        };
    }

    /**
     * Check if cumulative pending commissions reach the threshold and approve them
     */
    static async checkAndApproveCommissions(agentId: string): Promise<void> {
        const pendingCommissions = await Commission.find({
            agentId,
            status: "pending"
        });

        const totalPending = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
        const threshold = agentConfig.payout.minPayoutAmount; // ₦100,000

        if (totalPending >= threshold) {
            // Update all to approved
            await Commission.updateMany(
                {
                    agentId,
                    status: "pending"
                },
                {
                    $set: {
                        status: "approved",
                        approvedAt: new Date(),
                        description: `Commission threshold of ₦${threshold.toLocaleString()} reached. Ready for payout.`
                    }
                }
            );
        }
    }
}

export default CommissionService;
