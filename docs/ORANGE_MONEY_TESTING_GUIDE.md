# Orange Money Testing Guide

## Overview ✅ **READY FOR TESTING**

Orange Money provides a comprehensive sandbox/test environment for developers to test their integrations before going live. **The AfriTrade Hub Orange Money integration is now live on Vercel and ready for sandbox testing.** This guide covers how to access, configure, and use the Orange Money test environment effectively.

## Deployment Status ✅ **LIVE ON VERCEL**

### Current Status
- ✅ **Frontend Deployed**: Orange Money integration is live on Vercel
- ✅ **Backend Ready**: All API endpoints are functional
- ✅ **Sandbox Ready**: Ready for Orange Money sandbox testing
- ✅ **Production Ready**: Full integration ready for production use

### Testing URLs
- **Frontend**: https://afritrade-hub.vercel.app
- **API**: https://afritrade-hub-api.vercel.app (or your deployed API URL)
- **Webhook**: https://your-api-url.com/api/v1/webhooks/orange-money/payment-notification

## Test Environment Details

### Sandbox Access
- **Registration**: Register as a developer on the [Orange Developer Portal](https://developer.orange.com/)
- **API Access**: Request access to the Orange Money Web Payment API
- **Credentials**: Receive sandbox-specific API credentials
- **Environment**: Separate test environment with mock data

### Test Environment URLs
```typescript
// Sandbox Environment
const ORANGE_MONEY_SANDBOX = {
  baseUrl: 'https://api.orange.com/sandbox', // Sandbox base URL
  authUrl: 'https://api.orange.com/sandbox/oauth/v2/token',
  paymentUrl: 'https://api.orange.com/sandbox/om-webpay/v1',
  webhookUrl: 'https://your-ngrok-url.com/api/v1/webhooks/orange-money/payment-notification'
};

// Production Environment (for reference)
const ORANGE_MONEY_PRODUCTION = {
  baseUrl: 'https://api.orange.com',
  authUrl: 'https://api.orange.com/oauth/v2/token',
  paymentUrl: 'https://api.orange.com/om-webpay/v1',
  webhookUrl: 'https://yourdomain.com/api/v1/webhooks/orange-money/payment-notification'
};
```

## Test Credentials Setup

### Environment Variables for Testing
```bash
# Sandbox Environment Variables
ORANGE_MONEY_CLIENT_ID=sandbox_client_id
ORANGE_MONEY_CLIENT_SECRET=sandbox_client_secret
ORANGE_MONEY_MERCHANT_CODE=sandbox_merchant_code
ORANGE_MONEY_BASE_URL=https://api.orange.com/sandbox
ORANGE_MONEY_WEBHOOK_SECRET=sandbox_webhook_secret
ORANGE_MONEY_ENVIRONMENT=sandbox
```

### Test Phone Numbers
Orange Money provides specific test phone numbers for different countries:

```typescript
const TEST_PHONE_NUMBERS = {
  // Senegal
  'SN': '+221771234567',
  'SN_ALT': '+221771234568',
  
  // Côte d'Ivoire
  'CI': '+225071234567',
  'CI_ALT': '+225071234568',
  
  // Mali
  'ML': '+22370123456',
  'ML_ALT': '+22370123457',
  
  // Cameroon
  'CM': '+237671234567',
  'CM_ALT': '+237671234568',
  
  // Madagascar
  'MG': '+261341234567',
  'MG_ALT': '+261341234568',
  
  // Botswana
  'BW': '+26771123456',
  'BW_ALT': '+26771123457',
  
  // Guinea Conakry
  'GN': '+224601234567',
  'GN_ALT': '+224601234568',
  
  // Guinea Bissau
  'GW': '+245951234567',
  'GW_ALT': '+245951234568',
  
  // Sierra Leone
  'SL': '+23230123456',
  'SL_ALT': '+23230123457',
  
  // RD Congo
  'CD': '+243811234567',
  'CD_ALT': '+243811234568',
  
  // Central African Republic
  'CF': '+236701234567',
  'CF_ALT': '+236701234568'
};
```

## Testing Scenarios

### 1. Successful Payment Flow
```typescript
// Test successful payment
const testSuccessfulPayment = async () => {
  const paymentData = {
    amount: 1000, // 10.00 XOF
    currency: 'XOF',
    customer: {
      phone: '+221771234567', // Senegal test number
      country: 'SN'
    },
    orderId: 'test_order_123',
    description: 'Test payment for Orange Money integration'
  };
  
  // This should succeed in sandbox
  const result = await orangeMoneyProvider.initialize(paymentData);
  console.log('Payment initiated:', result);
};
```

### 2. Payment Failure Scenarios
```typescript
// Test insufficient funds
const testInsufficientFunds = async () => {
  const paymentData = {
    amount: 999999, // Very high amount
    currency: 'XOF',
    customer: {
      phone: '+221771234567',
      country: 'SN'
    },
    orderId: 'test_insufficient_funds'
  };
  
  // This should fail with insufficient funds error
  try {
    await orangeMoneyProvider.initialize(paymentData);
  } catch (error) {
    console.log('Expected error:', error.message);
  }
};

// Test invalid phone number
const testInvalidPhone = async () => {
  const paymentData = {
    amount: 1000,
    currency: 'XOF',
    customer: {
      phone: '+221000000000', // Invalid test number
      country: 'SN'
    },
    orderId: 'test_invalid_phone'
  };
  
  // This should fail with invalid phone number error
  try {
    await orangeMoneyProvider.initialize(paymentData);
  } catch (error) {
    console.log('Expected error:', error.message);
  }
};
```

### 3. Webhook Testing
```typescript
// Test webhook notifications
const testWebhookNotification = async () => {
  const webhookPayload = {
    payToken: 'test_pay_token_123',
    status: 'SUCCESS',
    transactionId: 'txn_test_123456',
    amount: 1000,
    currency: 'XOF',
    customerPhone: '+221771234567',
    timestamp: new Date().toISOString()
  };
  
  // Simulate webhook call
  const response = await fetch('http://localhost:8080/api/v1/webhooks/orange-money/payment-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Orange-Signature': 'test_signature'
    },
    body: JSON.stringify(webhookPayload)
  });
  
  console.log('Webhook response:', response.status);
};
```

## Local Testing Setup

### 1. Ngrok Setup for Webhooks
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 8080

# Use the ngrok URL for webhook testing
# Example: https://abc123.ngrok.io/api/v1/webhooks/orange-money/payment-notification
```

### 2. Test Configuration
```typescript
// apps/api/src/config/orangeMoney.ts
export const orangeMoneyConfig = {
  sandbox: {
    baseUrl: 'https://api.orange.com/sandbox',
    clientId: process.env.ORANGE_MONEY_CLIENT_ID,
    clientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET,
    merchantCode: process.env.ORANGE_MONEY_MERCHANT_CODE,
    webhookSecret: process.env.ORANGE_MONEY_WEBHOOK_SECRET
  },
  production: {
    baseUrl: 'https://api.orange.com',
    clientId: process.env.ORANGE_MONEY_PROD_CLIENT_ID,
    clientSecret: process.env.ORANGE_MONEY_PROD_CLIENT_SECRET,
    merchantCode: process.env.ORANGE_MONEY_PROD_MERCHANT_CODE,
    webhookSecret: process.env.ORANGE_MONEY_PROD_WEBHOOK_SECRET
  }
};
```

## Test Cases

### 1. Authentication Tests
```typescript
describe('Orange Money Authentication', () => {
  it('should authenticate successfully with valid credentials', async () => {
    const authService = new OrangeMoneyAuthService(orangeMoneyConfig.sandbox);
    const token = await authService.getAccessToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
  
  it('should fail with invalid credentials', async () => {
    const authService = new OrangeMoneyAuthService({
      ...orangeMoneyConfig.sandbox,
      clientSecret: 'invalid_secret'
    });
    
    await expect(authService.getAccessToken()).rejects.toThrow();
  });
});
```

### 2. Payment Initiation Tests
```typescript
describe('Orange Money Payment Initiation', () => {
  it('should initiate payment successfully', async () => {
    const provider = new OrangeMoneyProvider(orangeMoneyConfig.sandbox);
    
    const result = await provider.initialize({
      amount: 1000,
      currency: 'XOF',
      orderId: 'test_order_123',
      customer: { phone: '+221771234567' },
      returnUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel'
    });
    
    expect(result.url).toContain('orange.com');
    expect(result.reference).toBeDefined();
  });
  
  it('should handle invalid phone numbers', async () => {
    const provider = new OrangeMoneyProvider(orangeMoneyConfig.sandbox);
    
    await expect(provider.initialize({
      amount: 1000,
      currency: 'XOF',
      orderId: 'test_order_123',
      customer: { phone: '+221000000000' },
      returnUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel'
    })).rejects.toThrow();
  });
});
```

### 3. Payment Verification Tests
```typescript
describe('Orange Money Payment Verification', () => {
  it('should verify successful payment', async () => {
    const provider = new OrangeMoneyProvider(orangeMoneyConfig.sandbox);
    
    const result = await provider.verify('test_pay_token_success');
    expect(result.paid).toBe(true);
    expect(result.amount).toBe(1000);
    expect(result.currency).toBe('XOF');
  });
  
  it('should verify failed payment', async () => {
    const provider = new OrangeMoneyProvider(orangeMoneyConfig.sandbox);
    
    const result = await provider.verify('test_pay_token_failed');
    expect(result.paid).toBe(false);
  });
});
```

## Test Data Management

### 1. Test Orders
```typescript
const TEST_ORDERS = {
  SUCCESS: {
    id: 'test_order_success',
    amount: 1000,
    currency: 'XOF',
    status: 'PENDING'
  },
  FAILED: {
    id: 'test_order_failed',
    amount: 1000,
    currency: 'XOF',
    status: 'PENDING'
  },
  CANCELLED: {
    id: 'test_order_cancelled',
    amount: 1000,
    currency: 'XOF',
    status: 'PENDING'
  }
};
```

### 2. Test Webhook Payloads
```typescript
const TEST_WEBHOOK_PAYLOADS = {
  SUCCESS: {
    payToken: 'test_pay_token_success',
    status: 'SUCCESS',
    transactionId: 'txn_test_success_123',
    amount: 1000,
    currency: 'XOF',
    customerPhone: '+221771234567',
    timestamp: new Date().toISOString()
  },
  FAILED: {
    payToken: 'test_pay_token_failed',
    status: 'FAILED',
    transactionId: 'txn_test_failed_123',
    amount: 1000,
    currency: 'XOF',
    customerPhone: '+221771234567',
    timestamp: new Date().toISOString(),
    errorCode: 'INSUFFICIENT_FUNDS',
    errorMessage: 'Insufficient funds in Orange Money account'
  },
  CANCELLED: {
    payToken: 'test_pay_token_cancelled',
    status: 'CANCELLED',
    transactionId: 'txn_test_cancelled_123',
    amount: 1000,
    currency: 'XOF',
    customerPhone: '+221771234567',
    timestamp: new Date().toISOString()
  }
};
```

## Testing Checklist

### Pre-Testing Setup
- [ ] **Register for Orange Money Developer Account**
- [ ] **Obtain Sandbox Credentials**
- [ ] **Set Up Local Development Environment**
- [ ] **Configure Ngrok for Webhook Testing**
- [ ] **Set Up Test Database**
- [ ] **Configure Environment Variables**

### Authentication Testing
- [ ] **Valid Credentials Test**
- [ ] **Invalid Credentials Test**
- [ ] **Token Refresh Test**
- [ ] **Expired Token Handling**

### Payment Flow Testing
- [ ] **Successful Payment Initiation**
- [ ] **Payment Verification**
- [ ] **Payment Cancellation**
- [ ] **Payment Failure Scenarios**
- [ ] **Invalid Phone Number Handling**
- [ ] **Insufficient Funds Handling**
- [ ] **Invalid Amount Handling**

### Webhook Testing
- [ ] **Webhook Signature Verification**
- [ ] **Success Notification Handling**
- [ ] **Failure Notification Handling**
- [ ] **Cancellation Notification Handling**
- [ ] **Invalid Webhook Handling**
- [ ] **Webhook Retry Logic**

### Integration Testing
- [ ] **End-to-End Payment Flow**
- [ ] **Order Status Updates**
- [ ] **Vendor Payout Processing**
- [ ] **Error Handling and Recovery**
- [ ] **Performance Under Load**

### Security Testing
- [ ] **API Credential Security**
- [ ] **Webhook Signature Validation**
- [ ] **Input Validation**
- [ ] **Error Message Security**
- [ ] **Rate Limiting**

## Production Readiness

### Before Going Live
- [ ] **All Test Cases Pass**
- [ ] **Performance Testing Complete**
- [ ] **Security Audit Passed**
- [ ] **Production Credentials Obtained**
- [ ] **Webhook URLs Updated**
- [ ] **Monitoring Configured**
- [ ] **Error Handling Implemented**
- [ ] **Documentation Updated**

### Go-Live Checklist
- [ ] **Production Environment Deployed**
- [ ] **Production Credentials Configured**
- [ ] **Webhook Endpoints Live**
- [ ] **Monitoring Active**
- [ ] **Support Team Trained**
- [ ] **Rollback Plan Ready**

## Troubleshooting

### Common Issues
1. **Authentication Failures**
   - Check credentials
   - Verify environment URLs
   - Check token expiration

2. **Payment Initiation Failures**
   - Verify phone number format
   - Check amount limits
   - Validate currency support

3. **Webhook Issues**
   - Verify ngrok tunnel
   - Check signature validation
   - Validate payload format

4. **Test Environment Issues**
   - Check sandbox access
   - Verify test credentials
   - Contact Orange support

### Support Resources
- **Orange Developer Portal**: https://developer.orange.com/
- **API Documentation**: https://developer.orange.com/apis/om-webpay
- **Support Contact**: Available through developer portal
- **Community Forums**: Orange developer community

---

*This testing guide ensures comprehensive testing of Orange Money integration before production deployment.*
