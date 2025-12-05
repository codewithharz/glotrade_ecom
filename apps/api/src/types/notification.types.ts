// apps/api/src/types/notification.types.ts

// Core notification types based on priority order
export type NotificationType =
  // 1. ORDER LIFECYCLE (HIGHEST PRIORITY)
  | 'order_placed' | 'order_confirmed' | 'order_processing'
  | 'order_shipped' | 'order_delivered' | 'order_cancelled'
  | 'order_disputed' | 'order_refunded'

  // 2. PAYMENT LIFECYCLE (HIGH PRIORITY)
  | 'payment_pending' | 'payment_confirmed' | 'payment_failed'
  | 'payment_refunded' | 'payout_processed'

  // 2.5. WALLET TRANSACTIONS (HIGH PRIORITY)
  | 'wallet_transfer_received' | 'wallet_transfer_sent'
  | 'wallet_deposit_success' | 'wallet_deposit_failed'
  | 'wallet_withdrawal_success' | 'wallet_withdrawal_failed'
  | 'wallet_frozen' | 'wallet_unfrozen' | 'wallet_low_balance'
  | 'withdrawal_requested' | 'withdrawal_approved' | 'withdrawal_rejected'
  | 'withdrawal_completed' | 'withdrawal_failed'

  // 3. PRODUCT UPDATES (MEDIUM PRIORITY)
  | 'product_created' | 'product_updated' | 'product_out_of_stock'
  | 'product_back_in_stock' | 'price_changed' | 'new_review'

  // 4. SECURITY ALERTS (MEDIUM PRIORITY)
  | 'login_alert' | 'password_changed' | 'suspicious_activity'

  // 5. COMMUNICATION & BUSINESS
  | 'message_received' | 'support_ticket' | 'announcement'
  | 'new_order' | 'low_stock' | 'revenue_milestone' | 'promotion';

// Notification priority levels
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Notification status
export type NotificationStatus = 'unread' | 'read' | 'archived';

// Notification channels
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push' | 'webhook';

// Channel configuration interface
export interface ChannelConfig {
  type: NotificationChannel;
  enabled: boolean;
  config: Record<string, any>;
  lastSent?: Date;
  status: 'active' | 'failed' | 'disabled';
}

// Base notification data interface
export interface BaseNotificationData {
  [key: string]: any;
}

// Order-specific notification data
export interface OrderNotificationData extends BaseNotificationData {
  orderId: string;
  orderNumber?: string;
  totalAmount?: number;
  currency?: string;
  status?: string;
  buyerId?: string;
  sellerId?: string;
  productId?: string;
  productTitle?: string;
  quantity?: number;
}

// Payment-specific notification data
export interface PaymentNotificationData extends BaseNotificationData {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionId?: string;
}

// Product-specific notification data
export interface ProductNotificationData extends BaseNotificationData {
  productId: string;
  productTitle: string;
  price?: number;
  oldPrice?: number;
  quantity?: number;
  category?: string;
  sellerId?: string;
}

// Security-specific notification data
export interface SecurityNotificationData extends BaseNotificationData {
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
  timestamp: Date;
  action: string;
}

// Notification template interface
export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  defaultChannels: NotificationChannel[];
  variables: string[];
}

// User notification preferences
export interface NotificationPreferences {
  userId: string;
  globalEnabled: boolean;
  types: Record<NotificationType, boolean>;
  channels: Record<NotificationChannel, boolean>;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}

// Notification delivery result
export interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
  deliveredAt?: Date;
  retryCount: number;
}

// Notification creation options
export interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title?: string; // Optional - will be generated from template if not provided
  message?: string; // Optional - will be generated from template if not provided
  data?: BaseNotificationData;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  expiresAt?: Date;
}

// Notification update options
export interface UpdateNotificationOptions {
  status?: NotificationStatus;
  readAt?: Date;
  archivedAt?: Date;
  channels?: ChannelConfig[];
}

// Notification query filters
export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Notification statistics
export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  byChannel: Record<NotificationChannel, number>;
}

// Real-time notification event
export interface NotificationEvent {
  type: 'notification_created' | 'notification_updated' | 'notification_deleted';
  notification: any;
  userId: string;
  timestamp: Date;
}

import { Document, Types } from "mongoose";

// Notification document interface for Mongoose
export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  status: NotificationStatus;
  priority: NotificationPriority;
  channels: Array<{
    type: NotificationChannel;
    enabled: boolean;
    config: Record<string, any>;
    lastSent?: Date;
    status: 'active' | 'failed' | 'disabled';
  }>;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} 