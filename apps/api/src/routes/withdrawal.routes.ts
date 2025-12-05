import { Router } from "express";
import { WithdrawalController } from "../controllers/withdrawal.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();
const controller = new WithdrawalController();


// User routes
router.post("/request", requireAuth, controller.requestWithdrawal);
router.get("/history", requireAuth, controller.getHistory);
router.get("/banks", requireAuth, controller.getBanks);
router.get("/resolve-account", requireAuth, controller.resolveAccount);

// Admin routes
router.get("/admin/all", requireAuth, requireAdmin, controller.getAllWithdrawals);
router.post("/admin/:id/approve", requireAuth, requireAdmin, controller.approveWithdrawal);
router.post("/admin/:id/reject", requireAuth, requireAdmin, controller.rejectWithdrawal);

export default router;

