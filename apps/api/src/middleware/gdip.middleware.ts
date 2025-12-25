import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if user has access to GDIP features
 * Can be used to restrict GDIP to specific user types or verified partners
 */
export const requireGDIPAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check 1: KYC Verification (REQUIRED for GDIP)
        // GDIP requires verified partners due to high investment amounts
        if (user.kycStatus !== 'verified' && !user.isVerified) {
            return res.status(403).json({
                error: "KYC verification required for GDIP access",
                message: "Please complete KYC verification to access GDIP features",
                requiresKYC: true,
            });
        }

        // Check 2: Business Type Restriction (Optional)
        // Restrict GDIP to specific business types if needed
        const allowedBusinessTypes = ["Distributor", "Wholesaler"];
        const userBusinessType = user.businessInfo?.businessType;

        if (userBusinessType && !allowedBusinessTypes.includes(userBusinessType)) {
            return res.status(403).json({
                error: "GDIP access restricted to Distributors and Wholesalers",
                message: "Your business type does not have access to GDIP features",
            });
        }

        // Check 3: Account Status
        // Ensure account is active and not suspended
        if (user.isBlocked) {
            return res.status(403).json({
                error: "Account suspended",
                message: "Your account is suspended. Please contact support.",
            });
        }

        // All checks passed
        return next();
    } catch (error) {
        console.error("Error in GDIP access middleware:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Middleware to check minimum wallet balance for TPIA purchase
 */
export const checkMinimumBalance = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const Wallet = require("../models/Wallet").default;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const wallet = await Wallet.findOne({ userId: user._id });

        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const minimumBalance = 1000000; // ₦1,000,000 for TPIA

        if (wallet.balance < minimumBalance) {
            return res.status(400).json({
                error: "Insufficient wallet balance",
                required: minimumBalance,
                current: wallet.balance,
                shortfall: minimumBalance - wallet.balance,
            });
        }

        next();
    } catch (error) {
        console.error("Error checking wallet balance:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export default {
    requireGDIPAccess,
    checkMinimumBalance,
};
