# 🎫 Voucher System Testing Guide

## Overview
This document provides comprehensive testing scenarios for the AfriTrade Hub voucher system, covering all three discount types: **Percentage Off**, **Fixed Amount Off**, and **Free Shipping**.

## 🏗️ System Architecture
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: Next.js + TypeScript
- **Authentication**: Bearer token-based
- **API Base**: `/api/v1/vouchers`

---

## 📋 Test Environment Setup

### Prerequisites
1. **Database**: MongoDB running with test data
2. **API Server**: Backend running on configured port
3. **Frontend**: Web app accessible
4. **Test Users**: 
   - Buyer account (regular user)
   - Seller account (vendor)
   - Admin account (optional)

### Test Data Requirements
- Sample products with various prices
- User accounts with different roles
- Test orders with different amounts

---

## 🎯 Discount Type 1: Percentage Off

### Test Scenario: Basic Percentage Discount

#### **Setup**
```json
{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "maxUsage": 100,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2024-12-31T23:59:59.000Z",
  "userUsageLimit": 1,
  "description": "20% off your entire order"
}
```

#### **Test Cases**

##### **TC-001: Valid Percentage Discount**
- **Action**: Apply `SAVE20` to order of $100
- **Expected**: 20% discount = $20 off
- **Final Total**: $80
- **Validation**: 
  - Voucher code accepted
  - Discount calculated correctly
  - Order total updated

##### **TC-002: Maximum Discount Cap**
```json
{
  "code": "SAVE50",
  "type": "percentage",
  "value": 50,
  "maxDiscount": 25,
  "maxUsage": 100
}
```
- **Action**: Apply to $100 order
- **Expected**: 50% = $50, but capped at $25
- **Final Total**: $75
- **Validation**: Cap respected

##### **TC-003: Minimum Order Amount**
```json
{
  "code": "SAVE15",
  "type": "percentage",
  "value": 15,
  "minOrderAmount": 50,
  "maxUsage": 100
}
```
- **Action**: Apply to $30 order
- **Expected**: Rejected - below minimum
- **Validation**: Error message displayed

##### **TC-004: Percentage Edge Cases**
- **Test**: 0% discount
- **Expected**: No discount applied
- **Test**: 100% discount
- **Expected**: Order becomes free (if no max cap)

---

## 🎯 Discount Type 2: Fixed Amount Off

### Test Scenario: Fixed Dollar Amount Discount

#### **Setup**
```json
{
  "code": "SAVE10",
  "type": "fixed",
  "value": 10,
  "maxUsage": 100,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2024-12-31T23:59:59.000Z",
  "userUsageLimit": 1,
  "description": "$10 off your order"
}
```

#### **Test Cases**

##### **TC-101: Valid Fixed Discount**
- **Action**: Apply `SAVE10` to $50 order
- **Expected**: $10 off
- **Final Total**: $40
- **Validation**: Fixed amount applied correctly

##### **TC-102: Order Amount Less Than Discount**
- **Action**: Apply `SAVE10` to $5 order
- **Expected**: $5 off (discount capped at order amount)
- **Final Total**: $0
- **Validation**: Discount doesn't exceed order total

##### **TC-103: Large Fixed Discount**
```json
{
  "code": "SAVE100",
  "type": "fixed",
  "value": 100,
  "maxUsage": 10
}
```
- **Action**: Apply to $25 order
- **Expected**: $25 off (capped at order amount)
- **Final Total**: $0
- **Validation**: Large discounts handled properly

##### **TC-104: Fixed Amount with Minimum Order**
```json
{
  "code": "SAVE25",
  "type": "fixed",
  "value": 25,
  "minOrderAmount": 100,
  "maxUsage": 50
}
```
- **Action**: Apply to $75 order
- **Expected**: Rejected - below minimum
- **Validation**: Minimum order enforcement

---

## 🎯 Discount Type 3: Free Shipping

### Test Scenario: Shipping Cost Waiver

#### **Setup**
```json
{
  "code": "FREESHIP",
  "type": "free_shipping",
  "value": 0,
  "maxUsage": 200,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2024-12-31T23:59:59.000Z",
  "userUsageLimit": 2,
  "description": "Free shipping on your order"
}
```

#### **Test Cases**

##### **TC-201: Basic Free Shipping**
- **Action**: Apply `FREESHIP` to order with $15 shipping
- **Expected**: Shipping cost waived
- **Final Total**: Product total only (no shipping)
- **Validation**: Shipping cost removed

##### **TC-202: Free Shipping with Minimum Order**
```json
{
  "code": "FREESHIP50",
  "type": "free_shipping",
  "value": 0,
  "minOrderAmount": 50,
  "maxUsage": 100
}
```
- **Action**: Apply to $30 order
- **Expected**: Rejected - below minimum
- **Validation**: Minimum order enforcement

##### **TC-203: Free Shipping on Large Orders**
- **Action**: Apply to $200 order with $25 shipping
- **Expected**: Shipping waived
- **Final Total**: $200 (no shipping)
- **Validation**: Works on large orders

---

## 🔄 Usage Tracking & Limits

### Test Scenarios

#### **TC-301: User Usage Limit**
```json
{
  "code": "ONCEONLY",
  "type": "percentage",
  "value": 10,
  "userUsageLimit": 1,
  "maxUsage": 1000
}
```
- **Action**: User applies voucher twice
- **Expected**: First use succeeds, second rejected
- **Validation**: Per-user limit enforced

#### **TC-302: Total Usage Limit**
```json
{
  "code": "LIMITED50",
  "type": "fixed",
  "value": 5,
  "maxUsage": 50,
  "userUsageLimit": 1
}
```
- **Action**: 51st user tries to use
- **Expected**: Rejected - total limit reached
- **Validation**: Global usage limit enforced

#### **TC-303: Usage Analytics**
- **Action**: Create voucher, use multiple times
- **Expected**: Usage count increases
- **Validation**: Statistics updated correctly

---

## 📅 Date Validation

### Test Scenarios

#### **TC-401: Future Start Date**
```json
{
  "code": "FUTURE",
  "type": "percentage",
  "value": 15,
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validUntil": "2025-12-31T23:59:59.000Z"
}
```
- **Action**: Try to use before start date
- **Expected**: Rejected - "Coming Soon"
- **Validation**: Future dates handled

#### **TC-402: Expired Voucher**
```json
{
  "code": "EXPIRED",
  "type": "fixed",
  "value": 20,
  "validFrom": "2023-01-01T00:00:00.000Z",
  "validUntil": "2023-12-31T23:59:59.000Z"
}
```
- **Action**: Try to use expired voucher
- **Expected**: Rejected - "Expired"
- **Validation**: Past dates handled

#### **TC-403: Invalid Date Range**
- **Action**: Create voucher with end date before start date
- **Expected**: Validation error
- **Validation**: Date logic enforced

---

## 🎯 Product & Category Targeting

### Test Scenarios

#### **TC-501: Product-Specific Voucher**
```json
{
  "code": "PRODUCT20",
  "type": "percentage",
  "value": 20,
  "applicableProducts": ["product_id_1", "product_id_2"],
  "maxUsage": 100
}
```
- **Action**: Apply to targeted product
- **Expected**: Accepted
- **Action**: Apply to non-targeted product
- **Expected**: Rejected
- **Validation**: Product targeting works

#### **TC-502: Category-Specific Voucher**
```json
{
  "code": "CATEGORY15",
  "type": "percentage",
  "value": 15,
  "applicableCategories": ["electronics", "clothing"],
  "maxUsage": 100
}
```
- **Action**: Apply to electronics order
- **Expected**: Accepted
- **Action**: Apply to food order
- **Expected**: Rejected
- **Validation**: Category targeting works

---

## 👥 User Targeting

### Test Scenarios

#### **TC-601: User-Specific Voucher**
```json
{
  "code": "VIP25",
  "type": "percentage",
  "value": 25,
  "applicableUsers": ["user_id_1", "user_id_2"],
  "maxUsage": 50
}
```
- **Action**: Targeted user applies
- **Expected**: Accepted
- **Action**: Non-targeted user applies
- **Expected**: Rejected
- **Validation**: User targeting works

---

## 🧪 API Testing

### Endpoint Testing

#### **Create Voucher**
```bash
POST /api/v1/vouchers/create
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "code": "TEST20",
  "type": "percentage",
  "value": 20,
  "maxUsage": 100,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2024-12-31T23:59:59.000Z"
}
```

#### **Validate Voucher**
```bash
POST /api/v1/vouchers/validate
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "code": "TEST20",
  "orderAmount": 100,
  "productIds": ["product_1", "product_2"]
}
```

#### **Redeem Voucher**
```bash
POST /api/v1/vouchers/redeem
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "code": "TEST20",
  "orderId": "order_123"
}
```

---

## 🎭 Frontend Testing

### User Interface Testing

#### **TC-701: Voucher Creation Form**
- **Action**: Fill out all form fields
- **Expected**: Form submits successfully
- **Validation**: All validations work

#### **TC-702: Voucher Display**
- **Action**: View voucher list
- **Expected**: All vouchers displayed correctly
- **Validation**: Status badges, dates, values shown

#### **TC-703: Code Copy Functionality**
- **Action**: Click copy button
- **Expected**: Code copied to clipboard
- **Validation**: Success message shown

---

## 🚨 Error Handling

### Test Scenarios

#### **TC-801: Invalid Voucher Code**
- **Action**: Enter non-existent code
- **Expected**: "Invalid voucher code" error
- **Validation**: Clear error message

#### **TC-802: Expired Voucher**
- **Action**: Use expired voucher
- **Expected**: "Voucher expired" error
- **Validation**: Appropriate error handling

#### **TC-803: Usage Limit Exceeded**
- **Action**: Use voucher beyond limit
- **Expected**: "Usage limit exceeded" error
- **Validation**: Limit enforcement

---

## 📊 Performance Testing

### Load Testing

#### **TC-901: Multiple Concurrent Users**
- **Action**: 100 users apply vouchers simultaneously
- **Expected**: All requests processed
- **Validation**: No deadlocks or race conditions

#### **TC-902: Large Voucher Database**
- **Action**: 10,000 active vouchers
- **Expected**: Fast response times
- **Validation**: Performance maintained

---

## 🔒 Security Testing

### Test Scenarios

#### **TC-1001: Unauthorized Access**
- **Action**: Access voucher endpoints without auth
- **Expected**: 401 Unauthorized
- **Validation**: Authentication required

#### **TC-1002: Seller Access Control**
- **Action**: Seller tries to modify another's voucher
- **Expected**: 403 Forbidden
- **Validation**: Ownership enforced

#### **TC-1003: Input Validation**
- **Action**: Submit malicious input
- **Expected**: Validation errors
- **Validation**: XSS/SQL injection prevented

---

## 📝 Test Checklist

### Pre-Testing
- [ ] Database seeded with test data
- [ ] API server running
- [ ] Frontend accessible
- [ ] Test accounts created
- [ ] Test products available

### Core Functionality
- [ ] Percentage discounts work correctly
- [ ] Fixed amount discounts work correctly
- [ ] Free shipping vouchers work correctly
- [ ] Usage limits enforced
- [ ] Date validation works
- [ ] Product targeting works
- [ ] User targeting works

### Edge Cases
- [ ] Zero value discounts
- [ ] Maximum discount caps
- [ ] Minimum order amounts
- [ ] Expired vouchers
- [ ] Future start dates
- [ ] Usage limit boundaries

### Integration
- [ ] API endpoints respond correctly
- [ ] Frontend displays vouchers properly
- [ ] Error messages are clear
- [ ] Success feedback provided
- [ ] Database updates correctly

### Performance
- [ ] Response times acceptable
- [ ] Concurrent usage works
- [ ] Large datasets handled
- [ ] Memory usage stable

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ All three discount types work correctly
- ✅ Usage limits enforced properly
- ✅ Date validation functions correctly
- ✅ Targeting (product/category/user) works
- ✅ Error handling provides clear messages

### Non-Functional Requirements
- ✅ API response time < 200ms
- ✅ Frontend renders vouchers in < 1s
- ✅ Database queries optimized
- ✅ Security measures in place
- ✅ Error handling graceful

---

## 🚀 Next Steps

After completing these tests:

1. **Document Results**: Record all test outcomes
2. **Fix Issues**: Address any failures or bugs
3. **Performance Tuning**: Optimize slow operations
4. **Security Review**: Validate security measures
5. **User Acceptance**: Get stakeholder approval
6. **Production Deployment**: Deploy to live environment

---

## 📞 Support

For questions or issues during testing:
- **Backend Issues**: Check API logs and database
- **Frontend Issues**: Check browser console and network
- **Test Data**: Verify database seeding
- **Environment**: Ensure all services running

---

*This testing guide covers the comprehensive voucher system implementation. Follow each test case systematically to ensure robust functionality.* 