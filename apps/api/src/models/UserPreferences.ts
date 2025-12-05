import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  notificationPreferences: {
    channels: {
      in_app: boolean;
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    types: {
      order_placed: boolean;
      order_confirmed: boolean;
      order_processing: boolean;
      order_shipped: boolean;
      order_delivered: boolean;
      payment_confirmed: boolean;
      payment_failed: boolean;
      product_updates: boolean;
      security_alerts: boolean;
      promotions: boolean;
    };
    frequency: 'immediate' | 'daily' | 'weekly';
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notificationPreferences: {
    channels: {
      in_app: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    types: {
      order_placed: { type: Boolean, default: true },
      order_confirmed: { type: Boolean, default: true },
      order_processing: { type: Boolean, default: true },
      order_shipped: { type: Boolean, default: true },
      order_delivered: { type: Boolean, default: true },
      payment_confirmed: { type: Boolean, default: true },
      payment_failed: { type: Boolean, default: true },
      product_updates: { type: Boolean, default: true },
      security_alerts: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      // Wallet notifications
      wallet_transfer_received: { type: Boolean, default: true },
      wallet_transfer_sent: { type: Boolean, default: true },
      wallet_deposit_success: { type: Boolean, default: true },
      wallet_deposit_failed: { type: Boolean, default: true },
      wallet_withdrawal_success: { type: Boolean, default: true },
      wallet_withdrawal_failed: { type: Boolean, default: true },
      wallet_frozen: { type: Boolean, default: true },
      wallet_unfrozen: { type: Boolean, default: true },
      wallet_low_balance: { type: Boolean, default: true }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '08:00' }
    }
  }
}, {
  timestamps: true
});

// Create index on userId for faster queries
UserPreferencesSchema.index({ userId: 1 });

export default mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema); 