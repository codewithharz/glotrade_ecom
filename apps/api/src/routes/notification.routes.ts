// apps/api/src/routes/notification.routes.ts
import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { auth } from "../middleware/auth";
import { UserService } from "../services/UserService";

const router = Router();
const notificationController = new NotificationController();
const userService = new UserService();

// Apply authentication middleware to all routes
router.use(auth(userService));

// User notification routes (authenticated users)
router.get("/", notificationController.getUserNotifications);
router.get("/stats", notificationController.getNotificationStats);
router.get("/unread-count", notificationController.getUnreadCount);
router.get("/:id", notificationController.getNotification);

// User notification actions
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/:id/archive", notificationController.archiveNotification);
router.delete("/:id", notificationController.deleteNotification);
router.post("/mark-all-read", notificationController.markAllAsRead);

// Admin/System routes (require admin role)
router.post("/create", notificationController.createNotification);
router.post("/bulk-create", notificationController.bulkCreateNotifications);
router.post("/cleanup", notificationController.cleanupExpiredNotifications);

export default router; 