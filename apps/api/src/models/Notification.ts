// apps/api/src/models/Notification.ts
import mongoose, { Schema } from "mongoose";
import { INotification } from "../types/notification.types";

const notificationSchema = new Schema<INotification>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  type: { 
    type: String, 
    required: true, 
    index: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  data: { 
    type: Schema.Types.Mixed 
  },
  status: { 
    type: String, 
    enum: ['unread', 'read', 'archived'], 
    default: 'unread' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  channels: [{
    type: { 
      type: String, 
      enum: ['in_app', 'email', 'sms', 'push', 'webhook'] 
    },
    enabled: { 
      type: Boolean, 
      default: true 
    },
    config: { 
      type: Schema.Types.Mixed 
    },
    lastSent: Date,
    status: { 
      type: String, 
      enum: ['active', 'failed', 'disabled'], 
      default: 'active' 
    }
  }],
  readAt: Date,
  expiresAt: Date
}, { 
  timestamps: true 
});

// Performance indexes
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Auto-expire notifications after 30 days if not specified
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

export default mongoose.model<INotification>('Notification', notificationSchema); 