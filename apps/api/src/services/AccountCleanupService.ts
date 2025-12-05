// apps/api/src/services/AccountCleanupService.ts
import mongoose from 'mongoose';
import { IUser } from '../types/user.types';

export class AccountCleanupService {
  /**
   * Cleanup expired accounts that have passed the 60-day grace period
   * This should be run as a scheduled job (e.g., daily)
   */
  static async cleanupExpiredAccounts(): Promise<{ deleted: number; errors: string[] }> {
    const results = { deleted: 0, errors: [] as string[] };
    
    try {
      const User = mongoose.model('User');
      const Order = mongoose.model('Order');
      const Product = mongoose.model('Product');
      
      // Find accounts that have passed the grace period
      const expiredAccounts = await User.find({
        isDeletionRequested: true,
        gracePeriodEndsAt: { $lte: new Date() }
      });

      for (const account of expiredAccounts) {
        try {
          // Final check: ensure no unsettled orders
          const deletionCheck = await account.canDeleteAccount();
          
          if (!deletionCheck.canDelete) {
            // Extend grace period if still has unsettled orders
            account.gracePeriodEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 more days
            await account.save();
            continue;
          }

          // Permanently delete the account
          await this.permanentlyDeleteAccount(account._id);
          results.deleted++;
          
        } catch (error) {
          const errorMsg = `Failed to delete account ${account._id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
      
    } catch (error) {
      const errorMsg = `Account cleanup service error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(errorMsg);
      console.error(errorMsg);
    }
    
    return results;
  }

  /**
   * Permanently delete an account and anonymize/remove associated data
   */
  private static async permanentlyDeleteAccount(userId: mongoose.Types.ObjectId): Promise<void> {
    const User = mongoose.model('User');
    const Order = mongoose.model('Order');
    const Product = mongoose.model('Product');
    const Payout = mongoose.model('Payout');
    
    // Anonymize user data instead of completely removing it
    await User.findByIdAndUpdate(userId, {
      $set: {
        username: `deleted_user_${Date.now()}`,
        email: `deleted_${Date.now()}@deleted.com`,
        phone: undefined,
        address: undefined,
        profileImage: undefined,
        passwordHash: undefined,
        isDeletionRequested: false,
        deletionRequestedAt: undefined,
        deletionReason: undefined,
        gracePeriodEndsAt: undefined,
        canDelete: true,
        // Keep orders and products for business continuity
      }
    });

    // Note: We don't delete orders or products to maintain business continuity
    // The data remains but is no longer associated with the original user
  }

  /**
   * Send notifications to customers about seller account deletion
   * This should be run every 2 weeks as requested
   */
  static async notifyCustomersOfSellerDeletion(): Promise<{ notified: number; errors: string[] }> {
    const results = { notified: 0, errors: [] as string[] };
    
    try {
      const User = mongoose.model('User');
      const Order = mongoose.model('Order');
      
      // Find sellers who have requested deletion in the last 2 weeks
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const sellersToNotify = await User.find({
        role: 'seller',
        isDeletionRequested: true,
        deletionRequestedAt: { $gte: twoWeeksAgo }
      });

      for (const seller of sellersToNotify) {
        try {
          // Find customers with active orders from this seller
          const activeOrders = await Order.find({
            'lineItems.vendorId': seller._id,
            status: { $in: ['pending', 'processing', 'shipped'] }
          });

          // Group orders by customer
          const customerOrders = new Map();
          for (const order of activeOrders) {
            if (order.buyer) {
              if (!customerOrders.has(order.buyer.toString())) {
                customerOrders.set(order.buyer.toString(), []);
              }
              customerOrders.get(order.buyer.toString()).push(order);
            }
          }

          // Send notifications to each customer
          for (const [customerId, orders] of customerOrders) {
            try {
              // Here you would integrate with your notification service
              // For now, we'll just log the notification
              // console.log(`Notifying customer ${customerId} about seller ${seller.username} deletion. Orders affected: ${orders.length}`);
              
              // TODO: Send email/notification to customer
              // await notificationService.sendSellerDeletionNotice(customerId, seller.username, orders);
              
              results.notified++;
            } catch (error) {
              const errorMsg = `Failed to notify customer ${customerId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
              results.errors.push(errorMsg);
            }
          }
          
        } catch (error) {
          const errorMsg = `Failed to process seller ${seller._id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
        }
      }
      
    } catch (error) {
      const errorMsg = `Customer notification service error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(errorMsg);
      console.error(errorMsg);
    }
    
    return results;
  }

  /**
   * Check and extend grace periods for accounts with unsettled orders
   */
  static async extendGracePeriodsForUnsettledOrders(): Promise<{ extended: number; errors: string[] }> {
    const results = { extended: 0, errors: [] as string[] };
    
    try {
      const User = mongoose.model('User');
      
      const accountsWithUnsettledOrders = await User.find({
        isDeletionRequested: true,
        gracePeriodEndsAt: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // Within 7 days of expiry
      });

      for (const account of accountsWithUnsettledOrders) {
        try {
          const deletionCheck = await account.canDeleteAccount();
          
          if (!deletionCheck.canDelete) {
            // Extend grace period by 7 days
            account.gracePeriodEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await account.save();
            results.extended++;
            
            // console.log(`Extended grace period for account ${account._id} due to unsettled orders`);
          }
          
        } catch (error) {
          const errorMsg = `Failed to extend grace period for account ${account._id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
        }
      }
      
    } catch (error) {
      const errorMsg = `Grace period extension service error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(errorMsg);
      console.error(errorMsg);
    }
    
    return results;
  }
} 