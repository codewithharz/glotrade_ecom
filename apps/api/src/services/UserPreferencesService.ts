import UserPreferences, { IUserPreferences } from '../models/UserPreferences';

export interface NotificationPreferences {
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
}

export class UserPreferencesService {
  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const preferences = await UserPreferences.findOne({ userId });
      return preferences?.notificationPreferences || null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw new Error('Failed to get user preferences');
    }
  }

  /**
   * Create or update user notification preferences
   */
  static async saveUserPreferences(userId: string, preferences: NotificationPreferences): Promise<NotificationPreferences> {
    try {
      const result = await UserPreferences.findOneAndUpdate(
        { userId },
        { notificationPreferences: preferences },
        { 
          new: true, 
          upsert: true, 
          runValidators: true 
        }
      );
      
      return result.notificationPreferences;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save user preferences');
    }
  }

  /**
   * Get default notification preferences
   */
  static getDefaultPreferences(): NotificationPreferences {
    return {
      channels: {
        in_app: true,
        email: true,
        push: true,
        sms: false,
      },
      types: {
        order_placed: true,
        order_confirmed: true,
        order_processing: true,
        order_shipped: true,
        order_delivered: true,
        payment_confirmed: true,
        payment_failed: true,
        product_updates: true,
        security_alerts: true,
        promotions: true,
      },
      frequency: 'immediate',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    };
  }

  /**
   * Check if a specific notification type is enabled for a user
   */
  static async isNotificationTypeEnabled(userId: string, type: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences) return true; // Default to enabled if no preferences set
      
      return preferences.types[type as keyof typeof preferences.types] ?? true;
    } catch (error) {
      console.error('Error checking notification type:', error);
      return true; // Default to enabled on error
    }
  }

  /**
   * Check if a specific channel is enabled for a user
   */
  static async isChannelEnabled(userId: string, channel: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences) return true; // Default to enabled if no preferences set
      
      return preferences.channels[channel as keyof typeof preferences.channels] ?? true;
    } catch (error) {
      console.error('Error checking channel:', error);
      return true; // Default to enabled on error
    }
  }
} 