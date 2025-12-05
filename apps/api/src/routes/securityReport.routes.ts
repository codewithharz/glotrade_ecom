import { Router } from "express";
import { SecurityReportController } from "../controllers/securityReport.controller";
import { auth } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import { UserService } from "../services/UserService";

const router = Router();
const userService = new UserService();
const securityReportController = new SecurityReportController();

// Public route - anyone can submit a security report
router.post("/submit", securityReportController.submitReport);

// Admin routes - require admin authentication
router.use(auth(userService));
router.use(adminAuth);

router.get("/reports", securityReportController.getAllReports);
router.get("/reports/:id", securityReportController.getReportById);
router.put("/reports/:id", securityReportController.updateReportStatus);
router.get("/stats", securityReportController.getReportStats);
router.delete("/reports/:id", securityReportController.deleteReport);

export default router; 