import { Router } from "express";
import crypto from "crypto";
import Order from "../models/Order";
import { Payment } from "../models";

const router = Router();

// Orange Money Webhook Handler
router.post('/orange-money/payment-notification', async (req: any, res: any) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-orange-signature'];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.ORANGE_MONEY_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Orange Money webhook signature verification failed');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { payToken, status, transactionId, amount, currency, customerPhone, timestamp, errorCode, errorMessage } = req.body;
    
    console.log(`Orange Money webhook received: ${status} for payToken ${payToken}`);
    
    // Find the order by payment reference
    const order = await Order.findOne({ paymentReference: payToken });
    
    if (!order) {
      console.error(`Order not found for Orange Money payToken: ${payToken}`);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order based on payment status
    if (status === 'SUCCESS') {
      await Order.findOneAndUpdate(
        { _id: order._id },
        { 
          paymentStatus: 'completed',
          status: 'confirmed',
          paymentMethod: 'orange_money',
          paymentTransactionId: transactionId,
          updatedAt: new Date()
        }
      );

      // Create payment record
      await Payment.create({
        orderId: order._id,
        amount: amount,
        currency: currency,
        provider: 'orange_money',
        transactionId: transactionId,
        status: 'completed',
        reference: payToken,
        customerPhone: customerPhone,
        metadata: {
          orangeMoneyTransactionId: transactionId,
          customerPhone: customerPhone,
          timestamp: timestamp
        }
      });

      console.log(`Order ${order._id} payment completed via Orange Money`);
      
    } else if (status === 'FAILED') {
      await Order.findOneAndUpdate(
        { _id: order._id },
        { 
          paymentStatus: 'failed',
          status: 'cancelled',
          paymentMethod: 'orange_money',
          updatedAt: new Date()
        }
      );

      console.log(`Order ${order._id} payment failed via Orange Money: ${errorMessage || 'Unknown error'}`);
      
    } else if (status === 'CANCELLED') {
      await Order.findOneAndUpdate(
        { _id: order._id },
        { 
          paymentStatus: 'cancelled',
          status: 'cancelled',
          paymentMethod: 'orange_money',
          updatedAt: new Date()
        }
      );

      console.log(`Order ${order._id} payment cancelled via Orange Money`);
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Orange Money webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Generic webhook handler for other providers
router.post('/:provider/payment-notification', async (req: any, res: any) => {
  try {
    const { provider } = req.params;
    console.log(`Webhook received for provider: ${provider}`);
    
    // Handle different providers
    switch (provider) {
      case 'paystack':
        // Handle Paystack webhook
        break;
      case 'flutterwave':
        // Handle Flutterwave webhook
        break;
      default:
        console.log(`Unknown webhook provider: ${provider}`);
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error(`Webhook error for provider ${req.params.provider}:`, error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
