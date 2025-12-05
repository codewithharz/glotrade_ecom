// apps/api/src/services/DeviceTokenService.ts
import { Model, Document } from 'mongoose';
import { BaseService } from './BaseService';
import { DeviceToken } from './PushNotificationService';

export interface IDeviceToken extends Document {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  appVersion?: string;
  deviceModel?: string;
  lastUsed: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeviceTokenOptions {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  appVersion?: string;
  deviceModel?: string;
}

export interface UpdateDeviceTokenOptions {
  token?: string;
  appVersion?: string;
  deviceModel?: string;
  isActive?: boolean;
}

export class DeviceTokenService extends BaseService<IDeviceToken> {
  protected model: Model<IDeviceToken>;

  constructor() {
    super(DeviceTokenModel);
    this.model = DeviceTokenModel;
  }

  /**
   * Create or update device token
   */
  async upsertDeviceToken(options: CreateDeviceTokenOptions): Promise<IDeviceToken> {
    const existingToken = await this.model.findOne({
      userId: options.userId,
      token: options.token
    });

    if (existingToken) {
      // Update existing token
      existingToken.lastUsed = new Date();
      existingToken.appVersion = options.appVersion;
      existingToken.deviceModel = options.deviceModel;
      existingToken.isActive = true;
      
      return await existingToken.save();
    } else {
      // Create new token
      return await this.model.create({
        userId: options.userId,
        token: options.token,
        platform: options.platform,
        appVersion: options.appVersion,
        deviceModel: options.deviceModel,
        lastUsed: new Date(),
        isActive: true
      });
    }
  }

  /**
   * Get all active device tokens for a user
   */
  async getUserDeviceTokens(userId: string): Promise<IDeviceToken[]> {
    return await this.model.find({
      userId,
      isActive: true
    }).sort({ lastUsed: -1 });
  }

  /**
   * Get device tokens by platform for a user
   */
  async getUserDeviceTokensByPlatform(
    userId: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<IDeviceToken[]> {
    return await this.model.find({
      userId,
      platform,
      isActive: true
    }).sort({ lastUsed: -1 });
  }

  /**
   * Deactivate device token
   */
  async deactivateDeviceToken(userId: string, token: string): Promise<boolean> {
    const result = await this.model.updateOne(
      { userId, token },
      { isActive: false, updatedAt: new Date() }
    );
    
    return result.modifiedCount > 0;
  }

  /**
   * Deactivate all tokens for a user
   */
  async deactivateAllUserTokens(userId: string): Promise<boolean> {
    const result = await this.model.updateMany(
      { userId },
      { isActive: false, updatedAt: new Date() }
    );
    
    return result.modifiedCount > 0;
  }

  /**
   * Remove expired/inactive tokens
   */
  async cleanupInactiveTokens(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await this.model.deleteMany({
      $or: [
        { isActive: false },
        { lastUsed: { $lt: thirtyDaysAgo } }
      ]
    });
    
    return result.deletedCount || 0;
  }

  /**
   * Get token statistics
   */
  async getTokenStats(): Promise<{
    totalTokens: number;
    activeTokens: number;
    inactiveTokens: number;
    tokensByPlatform: Record<string, number>;
    tokensByUser: number;
  }> {
    const [
      totalTokens,
      activeTokens,
      inactiveTokens,
      platformStats,
      uniqueUsers
    ] = await Promise.all([
      this.model.countDocuments(),
      this.model.countDocuments({ isActive: true }),
      this.model.countDocuments({ isActive: false }),
      this.model.aggregate([
        {
          $group: {
            _id: '$platform',
            count: { $sum: 1 }
          }
        }
      ]),
      this.model.distinct('userId')
    ]);

    const tokensByPlatform: Record<string, number> = {};
    platformStats.forEach(stat => {
      tokensByPlatform[stat._id as string] = stat.count;
    });

    return {
      totalTokens,
      activeTokens,
      inactiveTokens,
      tokensByPlatform,
      tokensByUser: uniqueUsers.length
    };
  }

  /**
   * Validate and clean device tokens
   */
  async validateAndCleanTokens(): Promise<{
    validTokens: number;
    invalidTokens: number;
    cleanedTokens: number;
  }> {
    const allTokens = await this.model.find({ isActive: true });
    let validTokens = 0;
    let invalidTokens = 0;
    const tokensToClean: string[] = [];

    // This would typically integrate with Firebase to validate tokens
    // For now, we'll use a simple heuristic based on token format
    for (const deviceToken of allTokens) {
      if (this.isValidTokenFormat(deviceToken.token)) {
        validTokens++;
      } else {
        invalidTokens++;
        tokensToClean.push((deviceToken._id as any).toString());
      }
    }

    // Clean invalid tokens
    if (tokensToClean.length > 0) {
      await this.model.updateMany(
        { _id: { $in: tokensToClean } },
        { isActive: false, updatedAt: new Date() }
      );
    }

    return {
      validTokens,
      invalidTokens,
      cleanedTokens: tokensToClean.length
    };
  }

  /**
   * Simple token format validation
   */
  private isValidTokenFormat(token: string): boolean {
    // Basic validation - Firebase tokens are typically 140+ characters
    return token.length >= 140 && token.length <= 200;
  }

  /**
   * Get tokens for bulk operations
   */
  async getTokensForBulkOperation(userIds: string[]): Promise<Map<string, string[]>> {
    const tokens = await this.model.find({
      userId: { $in: userIds },
      isActive: true
    });

    const tokenMap = new Map<string, string[]>();
    
    tokens.forEach(token => {
      if (!tokenMap.has(token.userId)) {
        tokenMap.set(token.userId, []);
      }
      tokenMap.get(token.userId)!.push(token.token);
    });

    return tokenMap;
  }

  /**
   * Update token last used timestamp
   */
  async updateTokenLastUsed(token: string): Promise<void> {
    await this.model.updateOne(
      { token },
      { lastUsed: new Date() }
    );
  }

  /**
   * Get user's primary device token (most recently used)
   */
  async getUserPrimaryToken(userId: string): Promise<IDeviceToken | null> {
    return await this.model.findOne({
      userId,
      isActive: true
    }).sort({ lastUsed: -1 });
  }
}

// Device Token Model (this would typically be in a separate file)
import mongoose, { Schema } from 'mongoose';

const deviceTokenSchema = new Schema<IDeviceToken>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: true
  },
  appVersion: String,
  deviceModel: String,
  lastUsed: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
deviceTokenSchema.index({ userId: 1, platform: 1 });
deviceTokenSchema.index({ token: 1 }, { unique: true });
deviceTokenSchema.index({ lastUsed: 1 });
deviceTokenSchema.index({ isActive: 1 });

const DeviceTokenModel = mongoose.model<IDeviceToken>('DeviceToken', deviceTokenSchema);

export { DeviceTokenModel }; 