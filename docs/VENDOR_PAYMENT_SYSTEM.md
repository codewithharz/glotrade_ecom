# Vendor Payment System

## Overview

The vendor payment system automatically processes payments to vendors when their products are delivered. This ensures vendors receive compensation only after successful delivery, maintaining customer satisfaction and proper accounting records.

## How It Works

### 1. Order Status Update
When an order status is updated to "delivered" via the API endpoint:
```
PATCH /api/v1/orders/:orderId/status
{
  "status": "delivered"
}
```

### 2. Automatic Payment Processing
The system automatically:
- Groups line items by vendor
- Calculates payment amounts for each vendor
- Credits vendor wallets with the appropriate amounts
- Updates order payout status to "settled"

### 3. Multi-Vendor Support
For orders with products from multiple vendors:
- Each vendor receives payment for their specific products
- Payments are processed independently
- If one vendor payment fails, others continue processing

## Technical Implementation

### Order Controller Integration
```typescript
// In OrderController.updateStatus()
if (status === "delivered" && order.lineItems && order.lineItems.length > 0) {
  await this.processVendorPayments(orderId, order.lineItems);
}
```

### Payment Processing Logic
```typescript
private async processVendorPayments(orderId: string, lineItems: any[]) {
  // 1. Group line items by vendor
  const vendorPayments = new Map<string, PaymentInfo>();
  
  // 2. Calculate amounts per vendor
  for (const item of lineItems) {
    const vendorId = item.vendorId.toString();
    const itemTotal = item.unitPrice * item.qty;
    // ... accumulate payments
  }
  
  // 3. Process payments
  for (const [vendorId, payment] of vendorPayments) {
    await this.walletService.addFunds(
      vendorId,
      amountInKobo,
      currency,
      "vendor",
      `Payment for shipped order ${orderId}`,
      metadata,
      null, // No session for development
      "vendor_payment"
    );
  }
  
  // 4. Update order payout status
  await Order.updateOne(
    { _id: orderId },
    { $set: { payoutStatus: "settled" } }
  );
}
```

## API Endpoints

### Update Order Status
```
PATCH /api/v1/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "delivered"
}
```

**Response:**
```json
{
  "status": "success",
  "data": { "ok": true }
}
```

## Database Schema

### Order Model
```typescript
interface IOrder {
  // ... other fields
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "disputed";
  payoutStatus: "none" | "pending" | "settled" | "partial" | "failed";
  lineItems: Array<{
    productId: ObjectId;
    vendorId: ObjectId;
    qty: number;
    unitPrice: number;
    currency: string;
    productTitle?: string;
    productImage?: string;
  }>;
}
```

### Wallet Transaction
```typescript
interface IWalletTransaction {
  walletId: ObjectId;
  userId: ObjectId;
  type: "deposit" | "payment" | "transfer";
  category: "vendor_payment" | "order_payment" | ...;
  amount: number; // Positive for deposits, negative for payments
  currency: "NGN" | "ATH";
  balanceBefore: number;
  balanceAfter: number;
  status: "completed" | "pending" | "failed";
  reference: string;
  description: string;
  metadata: {
    orderId: string;
    paymentType: "vendor_payment";
    items: Array<{
      productId: string;
      productTitle: string;
      quantity: number;
      unitPrice: number;
    }>;
  };
}
```

## Currency Handling

### NGN (Nigerian Naira)
- Amounts stored in kobo (1 NGN = 100 kobo)
- Frontend displays in naira
- Backend processes in kobo for precision

### ATH (AfriTrade Token)
- Amounts stored as-is
- No conversion needed

## Error Handling

### Payment Failures
- Individual vendor payment failures don't stop other payments
- Errors are logged for debugging
- Order status update continues even if payments fail

### Retry Logic
- Failed payments can be retried manually
- System maintains idempotency to prevent duplicate payments

## Security Considerations

### Authorization
- Only authenticated users can update order status
- Role-based access control can be added for vendor/admin roles

### Idempotency
- Payment processing includes idempotency keys
- Prevents duplicate payments for the same order

### Audit Trail
- All payments are recorded in wallet transactions
- Comprehensive logging for debugging and auditing

## Testing

### Test Scenarios
1. **Single Vendor Order**: Verify payment to one vendor
2. **Multi-Vendor Order**: Verify payments to multiple vendors
3. **Payment Failure**: Test handling of failed payments
4. **Currency Conversion**: Test NGN kobo conversion
5. **Idempotency**: Test duplicate payment prevention

### Test Data
```typescript
// Sample order with multiple vendors
const testOrder = {
  lineItems: [
    {
      productId: "product1",
      vendorId: "vendor1",
      qty: 2,
      unitPrice: 5000, // 50 NGN
      currency: "NGN"
    },
    {
      productId: "product2", 
      vendorId: "vendor2",
      qty: 1,
      unitPrice: 10000, // 100 NGN
      currency: "NGN"
    }
  ]
};

// Expected payments:
// vendor1: 10,000 kobo (100 NGN)
// vendor2: 10,000 kobo (100 NGN)
```

## Monitoring and Logging

### Key Logs
- Payment processing start/completion
- Individual vendor payment amounts
- Payment failures and errors
- Order payout status updates

### Metrics to Track
- Payment success rate
- Average payment processing time
- Vendor payment volumes
- Failed payment reasons

## Future Enhancements

### Commission System
- Add platform commission deduction
- Configurable commission rates per vendor
- Commission tracking and reporting

### Payment Scheduling
- Batch payment processing
- Scheduled payment runs
- Payment approval workflows

### Advanced Features
- Partial payments for disputed orders
- Payment holds for new vendors
- Escrow system for high-value orders
- Multi-currency support expansion

## Troubleshooting

### Common Issues

#### Payment Not Processed
1. Check order status is "shipped"
2. Verify line items exist and have vendor IDs
3. Check vendor wallet exists and is active
4. Review server logs for error messages

#### Incorrect Payment Amount
1. Verify line item quantities and unit prices
2. Check currency conversion (NGN to kobo)
3. Review payment calculation logic

#### Duplicate Payments
1. Check idempotency key implementation
2. Review transaction history for duplicates
3. Verify order payout status

### Debug Commands
```bash
# Check order details
GET /api/v1/orders/:orderId

# Check vendor wallet balance
GET /api/v1/wallets/summary

# Check wallet transactions
GET /api/v1/wallets/transactions?userId=:vendorId
```

## Integration Points

### Frontend Integration
- Order management interface
- Vendor dashboard for payment tracking
- Admin panel for payment monitoring

### External Systems
- Payment gateway integration (future)
- Accounting system integration
- Tax reporting system integration

---

*This system ensures vendors receive timely payments while maintaining proper financial records and audit trails.*
