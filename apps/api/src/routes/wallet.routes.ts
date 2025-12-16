import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller";
import { auth } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import { UserService } from "../services/UserService";

const router = Router();
const walletController = new WalletController();
const userService = new UserService();

// Public routes (none for wallet - all require authentication)

// Protected routes (require user authentication)
router.use(auth(userService)); // Apply auth middleware to all routes below

// Get wallet summary
router.get("/summary", walletController.getWalletSummary);

// Get wallet balance for specific currency
router.get("/balance", walletController.getWalletBalance);

// Get transaction history
router.get("/transactions", walletController.getTransactionHistory);

// Analytics routes
router.get("/analytics", walletController.getWalletAnalytics);
router.get("/analytics/spending", walletController.getSpendingInsights);
router.get("/analytics/trends", walletController.getTransactionTrends);

// DEPRECATED: P2P transfer features disabled for wholesaler platform
// Search users for transfers
// router.get("/search", walletController.searchUsers);

// Get user's wallet info
router.get("/info", walletController.getWalletInfo);

// Get vendor earnings analytics (DEPRECATED for single-vendor platform)
// router.get("/vendor/earnings", walletController.getVendorEarnings);

// Contact management (DEPRECATED - used for P2P transfers)
// router.get("/contacts", walletController.getContacts);
// router.post("/contacts", walletController.addContact);
// router.put("/contacts/:contactId", walletController.updateContact);
// router.delete("/contacts/:contactId", walletController.deleteContact);

// Top up wallet
router.post("/topup", walletController.topUpWallet);

// Verify top-up payment
router.get("/verify-topup", walletController.verifyTopUp);

// DEPRECATED: P2P transfer routes disabled for wholesaler platform
// Validate transfer before execution
// router.post("/validate-transfer", walletController.validateTransfer);

// Transfer funds to another user
// router.post("/transfer", walletController.transferFunds);

// Create user wallets (for new users)
router.post("/create-user-wallets", walletController.createUserWallets);

// DEPRECATED: Vendor wallets for single-vendor platform
// Create vendor wallets
// router.post("/create-vendor-wallets", walletController.createVendorWallets);

// Export user transactions (user-level feature)
router.get("/export/transactions", walletController.exportTransactions);

// Pay for order using wallet
router.post("/pay-order", walletController.payOrder);

// Process wallet checkout (payment before order creation)
router.post("/checkout", walletController.processWalletCheckout);

// Admin routes (require admin authentication)
router.use(adminAuth); // Apply admin auth middleware to routes below

// Admin wallet management
router.get("/admin", walletController.getAllWallets);
router.get("/admin/stats", walletController.getWalletStats);

// Freeze funds (admin only)
router.post("/freeze", walletController.freezeFunds);

// Unfreeze funds (admin only)
router.post("/unfreeze", walletController.unfreezeFunds);

// Wallet freeze/unfreeze (admin only)
router.post("/:walletId/freeze", walletController.freezeWallet);
router.post("/:walletId/unfreeze", walletController.unfreezeWallet);
router.get("/:walletId/freeze-history", walletController.getWalletFreezeHistory);

// Admin wallet details and management
router.get("/admin/:walletId/details", walletController.getWalletDetails);
router.post("/admin/:walletId/adjust-balance", walletController.adjustWalletBalance);
router.post("/admin/:walletId/notes", walletController.addAdminNote);

// Admin export routes
router.get("/admin/export/transactions", walletController.exportAllTransactions);

// Set credit limit (admin only)
router.post("/:userId/credit-limit", walletController.setCreditLimit);

export default router;
