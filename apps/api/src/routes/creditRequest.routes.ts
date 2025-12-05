import { Router } from "express";
import creditRequestController from "../controllers/creditRequest.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// User routes (wholesalers)
router.post("/", requireAuth, creditRequestController.submitRequest);
router.get("/my-requests", requireAuth, creditRequestController.getMyRequests);
router.post("/:id/cancel", requireAuth, creditRequestController.cancelRequest);

// Admin routes
router.get("/", requireAuth, requireAdmin, creditRequestController.getAllRequests);
router.get("/:id", requireAuth, requireAdmin, creditRequestController.getRequestById);
router.post("/:id/approve", requireAuth, requireAdmin, creditRequestController.approveRequest);
router.post("/:id/reject", requireAuth, requireAdmin, creditRequestController.rejectRequest);

export default router;
