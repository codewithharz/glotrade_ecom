# Refund System Documentation

## Overview

The AfriTrade Hub platform implements a dual-endpoint refund system to handle different refund scenarios with appropriate levels of detail and flexibility. This document outlines the architecture, endpoints, and usage patterns.

## Architecture

### Two-Endpoint Design

The refund system uses two distinct API endpoints to serve different use cases:

1. **Simple Refund** (`POST /api/v1/admin/orders/:id/refund`)
2. **Detailed Refund** (`PUT /api/v1/admin/orders/:id/refund`)

This design allows for both quick admin actions and detailed refund management without compromising either use case.

## API Endpoints

### 1. Simple Refund Endpoint

**Endpoint:** `POST /api/v1/admin/orders/:id/refund`  
**Controller:** `adminController.processRefund`  
**Service:** `AdminService.processRefund()`  

#### Purpose
Quick admin refunds from the orders management interface with minimal configuration.

#### Request
```http
POST /api/v1/admin/orders/68a8e1cf33f1d36a18442159/refund
Content-Type: application/json

{}
```

#### Response
```json
{
  "status": "success",
  "data": {
    "_id": "68a8e1cf33f1d36a18442159",
    "status": "delivered",
    "paymentStatus": "refunded",
    "refundReason": "Admin refund",
    "refundAmount": 15000,
    "refundedAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Features
- ✅ No request body required
- ✅ Uses default "Admin refund" reason
- ✅ Refunds full order amount
- ✅ Perfect for quick admin actions
- ✅ Used by admin orders page modal

#### Validation
- Order must exist
- Order must be delivered (not cancelled, pending, etc.)
- Order must not already be refunded

---

### 2. Detailed Refund Endpoint

**Endpoint:** `PUT /api/v1/admin/orders/:id/refund`  
**Controller:** `adminController.refundOrder`  
**Service:** `AdminService.refundOrder()`  

#### Purpose
Advanced refund management with custom parameters for detailed documentation and partial refunds.

#### Request
```http
PUT /api/v1/admin/orders/68a8e1cf33f1d36a18442159/refund
Content-Type: application/json

{
  "reason": "Customer requested refund due to damaged product",
  "amount": 10000
}
```

#### Response
```json
{
  "status": "success",
  "data": {
    "_id": "68a8e1cf33f1d36a18442159",
    "status": "delivered",
    "paymentStatus": "refunded",
    "refundReason": "Customer requested refund due to damaged product",
    "refundAmount": 10000,
    "refundedAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Features
- ✅ Custom refund reason for documentation
- ✅ Partial refund support with custom amount
- ✅ Detailed refund metadata
- ✅ Used by advanced admin features
- ✅ Suitable for external integrations

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | Custom refund reason for documentation |
| `amount` | number | No | Custom refund amount (defaults to full order amount) |

#### Validation
- Order must exist
- Order must be delivered
- Order must not already be refunded
- Reason is required
- Amount must be positive (if provided)

## Frontend Integration

### Admin Orders Page

The admin orders page uses the **Simple Refund Endpoint** for its modal-based refund workflow:

```typescript
// File: apps/web/src/app/admin/orders/page.tsx
const handleOrderRefund = async () => {
  // Using POST /api/v1/admin/orders/:id/refund (processRefund)
  // This is the simple admin refund endpoint that:
  // - Requires no request body
  // - Uses default "Admin refund" reason
  // - Refunds full order amount
  // - Perfect for quick admin actions from the orders page
  await apiPost(`/api/v1/admin/orders/${selectedOrder._id}/refund`, {});
};
```

### Modal Workflow

1. **Confirmation Modal**: Admin clicks refund button
2. **Warning Display**: Shows refund details and consequences
3. **API Call**: Uses POST endpoint for simple refund
4. **Success Feedback**: Shows success modal with confirmation
5. **Data Refresh**: Updates orders list and statistics

## Database Schema

### Order Model Updates

When a refund is processed, the following fields are updated:

```typescript
{
  paymentStatus: "refunded",        // Changed from "completed"
  refundReason: string,             // Custom reason or "Admin refund"
  refundAmount: number,             // Refund amount (full or partial)
  refundedAt: Date,                 // Timestamp of refund
  updatedAt: Date                   // Last modification timestamp
}
```

### Status Validation

The refund system respects the following order status rules:

| Current Status | Can Refund? | Notes |
|----------------|-------------|-------|
| `pending` | ❌ | Must be delivered first |
| `processing` | ❌ | Must be delivered first |
| `shipped` | ❌ | Must be delivered first |
| `delivered` | ✅ | Can be refunded |
| `cancelled` | ❌ | Cannot refund cancelled orders |
| `disputed` | ❌ | Handle disputes separately |

## Error Handling

### Common Error Scenarios

#### 1. Order Not Found
```json
{
  "status": "error",
  "message": "Order not found"
}
```

#### 2. Order Already Refunded
```json
{
  "status": "error",
  "message": "Order is already refunded"
}
```

#### 3. Invalid Order Status
```json
{
  "status": "error",
  "message": "Can only refund delivered orders"
}
```

#### 4. Missing Required Field (PUT endpoint)
```json
{
  "status": "error",
  "message": "Refund reason is required"
}
```

## Future Enhancements

### Planned Features

1. **Refund History**: Track all refund actions with timestamps
2. **Partial Refund UI**: Admin interface for custom refund amounts
3. **Refund Analytics**: Dashboard showing refund trends and reasons
4. **Email Notifications**: Automatic customer notifications for refunds
5. **Payment Gateway Integration**: Direct refund processing with payment providers

### API Extensions

1. **Bulk Refunds**: Process multiple refunds at once
2. **Refund Templates**: Predefined refund reasons for common scenarios
3. **Refund Approval Workflow**: Multi-step approval for large refunds
4. **Refund Reversal**: Ability to reverse refunds if needed

## Development Guidelines

### When to Use Each Endpoint

#### Use POST Endpoint When:
- Building quick admin actions
- Creating simple refund workflows
- Implementing modal-based refunds
- No custom reason/amount needed

#### Use PUT Endpoint When:
- Building detailed refund management
- Creating external integrations
- Implementing partial refunds
- Need custom refund documentation

### Code Examples

#### Frontend Integration
```typescript
// Simple refund (current implementation)
await apiPost(`/api/v1/admin/orders/${orderId}/refund`, {});

// Detailed refund (future implementation)
await apiPut(`/api/v1/admin/orders/${orderId}/refund`, {
  reason: "Customer complaint resolved",
  amount: 5000
});
```

#### Backend Service Usage
```typescript
// Simple refund
const result = await adminService.processRefund(orderId);

// Detailed refund
const result = await adminService.refundOrder(orderId, reason, amount);
```

## Testing

### Test Scenarios

1. **Valid Refund**: Delivered order with valid refund
2. **Invalid Status**: Non-delivered order refund attempt
3. **Already Refunded**: Duplicate refund attempt
4. **Missing Order**: Non-existent order ID
5. **Partial Refund**: Custom amount refund
6. **Custom Reason**: Detailed refund with reason

### Test Data

```typescript
const testOrder = {
  _id: "68a8e1cf33f1d36a18442159",
  status: "delivered",
  paymentStatus: "completed",
  totalPrice: 15000,
  currency: "NGN"
};
```

## Security Considerations

1. **Admin Authentication**: All refund endpoints require admin authentication
2. **Authorization**: Verify admin has refund permissions
3. **Audit Trail**: Log all refund actions for security
4. **Amount Validation**: Ensure refund amounts don't exceed order total
5. **Rate Limiting**: Prevent abuse of refund endpoints

## Monitoring

### Key Metrics

1. **Refund Rate**: Percentage of orders that get refunded
2. **Refund Reasons**: Most common refund reasons
3. **Refund Amounts**: Average refund amounts
4. **Processing Time**: Time from refund request to completion
5. **Error Rate**: Failed refund attempts

### Alerts

1. **High Refund Rate**: Unusual spike in refunds
2. **Failed Refunds**: API errors or validation failures
3. **Large Refunds**: Refunds above certain threshold
4. **Duplicate Refunds**: Attempts to refund already refunded orders

---

## Changelog

### Version 1.0.0 (2024-01-15)
- ✅ Initial implementation of dual refund system
- ✅ Simple refund endpoint for admin orders page
- ✅ Detailed refund endpoint for advanced features
- ✅ Comprehensive validation and error handling
- ✅ Mobile-responsive admin interface
- ✅ Success/error modal system

---

*This document should be updated whenever the refund system is modified or extended.*