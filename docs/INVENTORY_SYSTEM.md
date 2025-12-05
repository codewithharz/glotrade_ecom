# Inventory Management System

## Overview

The AfriTrade Hub platform now includes a comprehensive inventory management system that properly tracks and updates product quantity/stock when orders are placed and payments are processed.

## Key Features

### ✅ Stock Reservation System
- **Order Creation**: Stock is reserved (not deducted) when an order is created
- **Payment Confirmation**: Stock is only permanently deducted after payment is confirmed
- **Automatic Rollback**: Reserved stock is automatically released if payment fails or order is cancelled

### ✅ Real-time Stock Updates
- **Immediate Reservation**: Stock availability is checked and reserved instantly
- **Payment-based Deduction**: Final stock reduction only occurs after successful payment
- **Automatic Restoration**: Stock is restored for failed payments and cancelled orders

### ✅ Vendor Inventory Management
- **Low Stock Alerts**: Vendors can monitor products with low inventory
- **Stock Adjustments**: Manual stock updates with audit trail
- **Bulk Operations**: Efficient bulk stock updates for multiple products

## How It Works

### 1. Order Creation Flow
```
User places order → Stock validation → Stock reservation → Order created (pending payment)
```

### 2. Payment Processing Flow
```
Payment initiated → Payment verification → Stock confirmed deducted → Order status updated
```

### 3. Failure Handling Flow
```
Payment fails → Stock automatically released → Order marked as failed
Order cancelled → Stock automatically released → Order status updated
```

## API Endpoints

### Order Management
- `POST /api/orders` - Create order with stock reservation
- `PUT /api/orders/:orderId/status` - Update order status (handles stock restoration for cancellations)

### Payment Processing
- `GET /api/payment/verify` - Verify payment and confirm stock deduction
- `POST /api/payment/webhook/*` - Webhook handlers for payment status updates

### Vendor Inventory Management
- `GET /api/vendor/inventory/low-stock` - Get low stock products
- `POST /api/vendor/inventory/adjust` - Adjust product stock
- `GET /api/vendor/inventory/movements/:productId` - Get stock movement history
- `POST /api/vendor/inventory/bulk-update` - Bulk stock updates

## Database Schema Changes

### Order Model Updates
- Removed problematic `post("save")` hook that deducted stock immediately
- Added proper stock validation in `pre("save")` hook
- Stock management now handled by dedicated service

### Product Model
- `quantity` field tracks available stock
- Stock is updated through InventoryService methods
- No direct stock modifications in order creation

## Security Features

### Vendor Access Control
- Vendors can only manage their own product inventory
- All inventory operations require authentication
- Stock adjustments are logged with reasons and timestamps

### Stock Validation
- Prevents negative stock quantities
- Validates stock availability before reservation
- Automatic rollback on failures

## Error Handling

### Graceful Degradation
- Inventory operations continue even if logging fails
- Payment processing continues even if inventory updates fail
- Comprehensive error logging for debugging

### Rollback Mechanisms
- Automatic stock restoration on payment failures
- Order cleanup on stock reservation failures
- Transaction-like behavior for critical operations

## Testing

### Test Script
Run the inventory system test:
```bash
cd apps/api
npm run ts-node src/scripts/testInventorySystem.ts
```

### Test Coverage
- Stock reservation and release
- Payment confirmation flow
- Error handling and rollbacks
- Vendor inventory operations

## Configuration

### Environment Variables
- Database connection settings
- Payment provider configurations
- Inventory thresholds and limits

### Customization Options
- Low stock threshold (default: 5)
- Stock movement logging level
- Automatic reorder triggers

## Monitoring and Alerts

### Low Stock Notifications
- Vendors receive alerts for products below threshold
- Admin dashboard shows overall inventory status
- Real-time stock level monitoring

### Audit Trail
- All stock movements are logged
- Reason codes for each adjustment
- Timestamp and user tracking

## Performance Considerations

### Database Operations
- Efficient stock updates using `$inc` operations
- Indexed queries for inventory lookups
- Batch operations for bulk updates

### Caching Strategy
- Stock levels cached for frequently accessed products
- Real-time updates for critical inventory changes
- Optimized queries for vendor dashboards

## Future Enhancements

### Planned Features
- **Stock Forecasting**: AI-powered demand prediction
- **Automatic Reordering**: Integration with supplier systems
- **Multi-location Inventory**: Support for multiple warehouses
- **Advanced Analytics**: Detailed inventory performance metrics

### Integration Opportunities
- **Supplier APIs**: Direct stock updates from suppliers
- **Shipping Providers**: Real-time inventory sync
- **Accounting Systems**: Automated cost tracking
- **Marketplace APIs**: Cross-platform inventory sync

## Troubleshooting

### Common Issues
1. **Stock Not Updating**: Check payment status and order flow
2. **Negative Stock**: Verify inventory service operations
3. **Missing Notifications**: Check notification service configuration

### Debug Mode
Enable detailed logging for inventory operations:
```typescript
// Set environment variable
DEBUG_INVENTORY=true
```

## Support

For technical support or questions about the inventory system:
- Check the logs for detailed error messages
- Verify database connectivity and permissions
- Test with the provided test script
- Review the API documentation for endpoint usage

---

**Note**: This inventory system is designed to be robust and handle edge cases gracefully. Always test thoroughly in development before deploying to production. 