import { Response } from 'express';
import { UserPreferencesService, NotificationPreferences } from '../services/UserPreferencesService';
import { AuthRequest } from '../middleware/auth';

export class UserPreferencesController {
  /**
   * Get user notification preferences
   */
  static async getUserPreferences(req: any, res: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const preferences = await UserPreferencesService.getUserPreferences(userId);
      
      if (!preferences) {
        // Return default preferences if none exist
        const defaultPreferences = UserPreferencesService.getDefaultPreferences();
        return res.status(200).json({
          success: true,
          data: {
            preferences: defaultPreferences,
            isDefault: true
          }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          preferences,
          isDefault: false
        }
      });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user preferences'
      });
    }
  }

  /**
   * Save user notification preferences
   */
  static async saveUserPreferences(req: any, res: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const preferences: NotificationPreferences = req.body.preferences;
      
      if (!preferences) {
        return res.status(400).json({
          success: false,
          message: 'Preferences data is required'
        });
      }

      // Validate preferences structure
      if (!preferences.channels || !preferences.types || !preferences.frequency || !preferences.quietHours) {
        return res.status(400).json({
          success: false,
          message: 'Invalid preferences structure'
        });
      }

      const savedPreferences = await UserPreferencesService.saveUserPreferences(userId, preferences);

      res.status(200).json({
        success: true,
        message: 'Preferences saved successfully',
        data: {
          preferences: savedPreferences
        }
      });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save user preferences'
      });
    }
  }

  /**
   * Reset user preferences to defaults
   */
  static async resetUserPreferences(req: any, res: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const defaultPreferences = UserPreferencesService.getDefaultPreferences();
      const savedPreferences = await UserPreferencesService.saveUserPreferences(userId, defaultPreferences);

      res.status(200).json({
        success: true,
        message: 'Preferences reset to defaults successfully',
        data: {
          preferences: savedPreferences
        }
      });
    } catch (error) {
      console.error('Error resetting user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset user preferences'
      });
    }
  }
} 