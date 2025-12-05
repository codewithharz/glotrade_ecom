// Express types handled by any
import { AuthRequest } from "../middleware/auth";
import { ValidationError } from "../utils/errors";
import { SecurityReport } from "../models/SecurityReport";
import { NotificationService } from "../services/NotificationService";

export class SecurityReportController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  // Submit a new security report
  submitReport = async (req: any, res: any, next: any) => {
    try {
      const body = req.body || {};
      const userId = req.user?.id;
      
      // Validate required fields
      if (!body.reportType || !body.description || !body.suspiciousElements || !body.actionTaken) {
        throw new ValidationError("Report type, description, suspicious elements, and action taken are required");
      }

      // Validate report type
      if (!["communication", "website", "jobs"].includes(body.reportType)) {
        throw new ValidationError("Invalid report type");
      }

      // Validate suspicious elements array
      if (!Array.isArray(body.suspiciousElements) || body.suspiciousElements.length === 0) {
        throw new ValidationError("At least one suspicious element must be selected");
      }

      // Prepare report data
      const reportData: any = {
        userId,
        reportType: body.reportType,
        description: body.description,
        suspiciousElements: body.suspiciousElements,
        actionTaken: body.actionTaken,
        additionalDetails: body.additionalDetails,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent")
      };

      // Add type-specific fields
      switch (body.reportType) {
        case "communication":
          reportData.communicationType = body.type;
          reportData.sender = body.sender;
          reportData.contactDate = body.date;
          reportData.contactTime = body.time;
          reportData.phoneNumber = body.phoneNumber;
          reportData.emailAddress = body.emailAddress;
          break;
        
        case "website":
          reportData.websiteUrl = body.url;
          reportData.appName = body.appName;
          reportData.appStore = body.appStore;
          break;
        
        case "jobs":
          reportData.companyName = body.companyName;
          reportData.jobTitle = body.jobTitle;
          reportData.platform = body.platform;
          break;
      }

      // Create the report
      const report = await SecurityReport.create(reportData);

      // Send notification to admin team (if notification service is available)
      try {
        await this.notificationService.sendAdminNotification({
          type: "security_report",
          title: `New Security Report: ${body.reportType}`,
          message: `A new ${body.reportType} report has been submitted with ${body.suspiciousElements.length} suspicious elements.`,
          data: {
            reportId: report._id,
            reportType: body.reportType,
            priority: report.priority
          }
        });
      } catch (error) {
        console.error("Failed to send admin notification:", error);
        // Don't fail the report submission if notification fails
      }

      res.status(201).json({
        status: "success",
        data: {
          report: {
            id: report._id,
            reportType: report.reportType,
            status: report.status,
            priority: report.priority,
            reportedAt: report.reportedAt
          },
          message: "Security report submitted successfully. Our team will investigate."
        }
      });
    } catch (e) {
      next(e as any);
    }
  };

  // Get all reports (admin only)
  getAllReports = async (req: any, res: any, next: any) => {
    try {
      if (!req.user || (req.user.role !== 'admin' && !req.user.isSuperAdmin)) {
        throw new ValidationError("Admin access required");
      }

      const { page = 1, limit = 20, status, priority, reportType, sortBy = "createdAt", sortOrder = "desc" } = req.query;

      const query: any = {};
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (reportType) query.reportType = reportType;

      const sort: any = {};
      sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

      const skip = (Number(page) - 1) * Number(limit);

      const [reports, total] = await Promise.all([
        SecurityReport.find(query)
          .sort(sort)
          .skip(skip)
          .limit(Number(limit))
          .populate("userId", "name email")
          .populate("assignedTo", "name email"),
        SecurityReport.countDocuments(query)
      ]);

      res.json({
        status: "success",
        data: {
          reports,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (e) {
      next(e as any);
    }
  };

  // Get report by ID (admin only)
  getReportById = async (req: any, res: any, next: any) => {
    try {
      if (!req.user || (req.user.role !== 'admin' && !req.user.isSuperAdmin)) {
        throw new ValidationError("Admin access required");
      }

      const { id } = req.params;
      const report = await SecurityReport.findById(id)
        .populate("userId", "name email")
        .populate("assignedTo", "name email");

      if (!report) {
        throw new ValidationError("Report not found");
      }

      res.json({
        status: "success",
        data: { report }
      });
    } catch (e) {
      next(e as any);
    }
  };

  // Update report status (admin only)
  updateReportStatus = async (req: any, res: any, next: any) => {
    try {
      if (!req.user || (req.user.role !== 'admin' && !req.user.isSuperAdmin)) {
        throw new ValidationError("Admin access required");
      }

      const { id } = req.params;
      const { status, assignedTo, investigationNotes, resolution } = req.body;

      const updateData: any = {};
      if (status) updateData.status = status;
      if (investigationNotes) updateData.investigationNotes = investigationNotes;
      if (resolution) {
        updateData.resolution = resolution;
        updateData.resolvedAt = new Date();
      }

      // Handle assignedTo - if it's a string (name/email), we'll store it as investigationNotes
      // For now, we'll just store the assignee info in investigationNotes
      if (assignedTo && assignedTo.trim()) {
        updateData.investigationNotes = `${updateData.investigationNotes || ''}\n\nAssigned to: ${assignedTo.trim()}`.trim();
      }

      const report = await SecurityReport.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate("userId", "name email")
       .populate("assignedTo", "name email");

      if (!report) {
        throw new ValidationError("Report not found");
      }

      res.json({
        status: "success",
        data: { report },
        message: "Report updated successfully"
      });
    } catch (e: any) {
      console.error("Error updating security report:", e);
      if (e.name === 'ValidationError') {
        return res.status(400).json({
          status: "error",
          message: "Validation error: " + e.message
        });
      }
      if (e.name === 'CastError') {
        return res.status(400).json({
          status: "error",
          message: "Invalid report ID format"
        });
      }
      next(e);
    }
  };

  // Get report statistics (admin only)
  getReportStats = async (req: any, res: any, next: any) => {
    try {
      if (!req.user || (req.user.role !== 'admin' && !req.user.isSuperAdmin)) {
        throw new ValidationError("Admin access required");
      }

      const { days = 30 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      const stats = await SecurityReport.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              reportType: "$reportType",
              status: "$status",
              priority: "$priority"
            },
            count: { $sum: 1 }
          }
        }
      ]);

      // Process stats into a more readable format
      const processedStats = {
        totalReports: 0,
        byType: { communication: 0, website: 0, jobs: 0 } as Record<string, number>,
        byStatus: { pending: 0, investigating: 0, resolved: 0, closed: 0 } as Record<string, number>,
        byPriority: { low: 0, medium: 0, high: 0, urgent: 0 } as Record<string, number>
      };

      stats.forEach(({ _id, count }) => {
        processedStats.totalReports += count;
        if (_id.reportType && typeof _id.reportType === 'string') {
          processedStats.byType[_id.reportType] += count;
        }
        if (_id.status && typeof _id.status === 'string') {
          processedStats.byStatus[_id.status] += count;
        }
        if (_id.priority && typeof _id.priority === 'string') {
          processedStats.byPriority[_id.priority] += count;
        }
      });

      res.json({
        status: "success",
        data: {
          period: `${days} days`,
          stats: processedStats
        }
      });
    } catch (e) {
      next(e as any);
    }
  };

  // Delete report (admin only)
  deleteReport = async (req: any, res: any, next: any) => {
    try {
      if (!req.user || (req.user.role !== 'admin' && !req.user.isSuperAdmin)) {
        throw new ValidationError("Admin access required");
      }

      const { id } = req.params;
      const report = await SecurityReport.findByIdAndDelete(id);

      if (!report) {
        throw new ValidationError("Report not found");
      }

      res.json({
        status: "success",
        message: "Report deleted successfully"
      });
    } catch (e) {
      next(e as any);
    }
  };
} 