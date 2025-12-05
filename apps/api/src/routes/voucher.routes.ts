import { Router } from "express";
import { VoucherController } from "../controllers/voucher.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
const voucherController = new VoucherController();

// All routes require authentication
router.use(requireAuth);

// Voucher management for sellers and admins
router.post("/create", voucherController.createVoucher);
router.get("/my-vouchers", voucherController.getMyVouchers);

// Voucher usage for buyers
router.post("/validate", voucherController.validateVoucher);
router.post("/redeem", voucherController.redeemVoucher);
router.post("/record-usage", voucherController.recordVoucherUsage);
router.get("/available", voucherController.getAvailableVouchers);
router.get("/my-usage", voucherController.getUserVoucherUsage);

// Utility endpoints
router.post("/generate-code", voucherController.generateCode);

// Admin only endpoints
router.get("/admin/all-active", voucherController.getAllActiveVouchers);

// Parameterized routes (must come after specific routes)
router.put("/:voucherId", voucherController.updateVoucher);
router.delete("/:voucherId", voucherController.deactivateVoucher);
router.patch("/:voucherId/activate", voucherController.activateVoucher);
router.get("/:voucherId/stats", voucherController.getVoucherStats);
router.get("/:voucherId", voucherController.getVoucherById);

export default router; 