import { User } from "../models";
import { IUser } from "../types/user.types";

export class CreditService {
    /**
     * Check if a user has enough credit for a transaction
     */
    async checkCreditAvailability(userId: string, amount: number): Promise<{ available: boolean; message?: string }> {
        const user = await User.findById(userId);
        if (!user || !user.businessInfo) {
            return { available: false, message: "User not found or not a business account" };
        }

        if (user.businessInfo.paymentTerms === "prepaid") {
            return { available: false, message: "User is on prepaid terms" };
        }

        const limit = user.businessInfo.creditLimit || 0;
        const usage = user.businessInfo.currentCreditUsage || 0;
        const availableCredit = limit - usage;

        if (availableCredit >= amount) {
            return { available: true };
        } else {
            return {
                available: false,
                message: `Insufficient credit. Available: ${availableCredit}, Required: ${amount}`
            };
        }
    }

    /**
     * Reserve credit for an order
     */
    async reserveCredit(userId: string, amount: number): Promise<void> {
        const check = await this.checkCreditAvailability(userId, amount);
        if (!check.available) {
            throw new Error(check.message || "Insufficient credit");
        }

        await User.updateOne(
            { _id: userId },
            { $inc: { "businessInfo.currentCreditUsage": amount } }
        );
    }

    /**
     * Release credit (e.g., when an order is paid or cancelled)
     */
    async releaseCredit(userId: string, amount: number): Promise<void> {
        await User.updateOne(
            { _id: userId },
            { $inc: { "businessInfo.currentCreditUsage": -amount } }
        );
    }

    /**
     * Update credit settings for a user (Admin only)
     */
    async updateCreditSettings(userId: string, limit: number, terms: string): Promise<IUser | null> {
        return User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "businessInfo.creditLimit": limit,
                    "businessInfo.paymentTerms": terms
                }
            },
            { new: true }
        );
    }
}
