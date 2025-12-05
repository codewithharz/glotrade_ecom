// apps/api/src/controllers/notification.controller.ts
// Express types handled by any
import { NotificationService } from "../services/NotificationService";
import { AuthRequest } from "../middleware/auth";
import { ValidationError } from "../utils/errors";

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Get user's notifications with filtering
   */
  getUserNotifications = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      const filters = {
        type: req.query.type as any,
        status: req.query.status as any,
        priority: req.query.priority as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const result = await this.notificationService.getUserNotifications(req.user.id, filters);

      res.status(200).json({
        status: "success",
        data: {
          notifications: result.notifications,
          total: result.total,
          limit: filters.limit,
          offset: filters.offset
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get specific notification by ID
   */
  getNotification = async (
    req: any & { params: { id: string } },
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      const notification = await this.notificationService.findById(req.params.id);
      
      // Verify ownership
      if (notification.userId.toString() !== req.user.id) {
        throw new ValidationError("Access denied");
      }

      res.status(200).json({
        status: "success",
        data: notification
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark notification as read
   */
  markAsRead = async (
    req: any & { params: { id: string } },
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      const notification = await this.notificationService.markAsRead(req.params.id, req.user.id);

      res.status(200).json({
        status: "success",
        data: notification
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark all notifications as read
   */
  markAllAsRead = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      const result = await this.notificationService.markAllAsRead(req.user.id);

      res.status(200).json({
        status: "success",
        data: {
          message: `Marked ${result.modifiedCount} notifications as read`,
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Archive notification
   */
  archiveNotification = async (
    req: any & { params: { id: string } },
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      const notification = await this.notificationService.archiveNotification(req.params.id, req.user.id);

      res.status(200).json({
        status: "success",
        data: notification
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete notification
   */
  deleteNotification = async (
    req: any & { params: { id: string } },
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      await this.notificationService.deleteNotification(req.params.id, req.user.id);

      res.status(200).json({
        status: "success",
        data: {
          message: "Notification deleted successfully"
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get notification statistics for user
   */
  getNotificationStats = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      const stats = await this.notificationService.getUserNotificationStats(req.user.id);

      res.status(200).json({
        status: "success",
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get unread count for user
   */
  getUnreadCount = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      const count = await this.notificationService.getUnreadCount(req.user.id);

      res.status(200).json({
        status: "success",
        data: { unreadCount: count }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create notification (admin/system use)
   */
  createNotification = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      // Only allow admins to create notifications
      if (req.user.role !== 'admin') {
        throw new ValidationError("Insufficient permissions");
      }

      const { userId, type, title, message, data, priority, channels, expiresAt } = req.body;

      if (!userId || !type || !title || !message) {
        throw new ValidationError("Missing required fields");
      }

      const notification = await this.notificationService.createNotification({
        userId,
        type,
        title,
        message,
        data,
        priority,
        channels,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });

      res.status(201).json({
        status: "success",
        data: notification
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk create notifications (admin/system use)
   */
  bulkCreateNotifications = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      // Only allow admins to create bulk notifications
      if (req.user.role !== 'admin') {
        throw new ValidationError("Insufficient permissions");
      }

      const { notifications } = req.body;

      if (!Array.isArray(notifications) || notifications.length === 0) {
        throw new ValidationError("Notifications array is required");
      }

      const createdNotifications = await this.notificationService.bulkCreateNotifications(notifications);

      res.status(201).json({
        status: "success",
        data: {
          message: `Created ${createdNotifications.length} notifications`,
          notifications: createdNotifications
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Clean up expired notifications (admin/system use)
   */
  cleanupExpiredNotifications = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?.id) {
        throw new ValidationError("Authentication required");
      }

      // Only allow admins to cleanup notifications
      if (req.user.role !== 'admin') {
        throw new ValidationError("Insufficient permissions");
      }

      const result = await this.notificationService.cleanupExpiredNotifications();

      res.status(200).json({
        status: "success",
        data: {
          message: `Cleaned up ${result.deletedCount} expired notifications`,
          deletedCount: result.deletedCount
        }
      });
    } catch (error) {
      next(error);
    }
  };
} 