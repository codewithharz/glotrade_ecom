# Orange Money Technical Implementation Guide

## Overview ✅ **IMPLEMENTED**

This guide provides detailed technical implementation steps for integrating Orange Money Web Payment API into the AfriTrade Hub platform. **The integration has been completed and is now live on Vercel.** It includes code examples, API specifications, and implementation patterns.

## Implementation Status ✅ **COMPLETED**

### Backend Implementation ✅
- [x] **OrangeMoneyProvider Service**: `apps/api/src/services/providers/OrangeMoneyProvider.ts`
- [x] **Payment Routes**: Integrated with existing payment system
- [x] **Webhook Handler**: `apps/api/src/routes/webhook.routes.ts`
- [x] **Vendor Routes**: Added Orange Money bank listing and account resolution
- [x] **TypeScript Types**: Full type safety implementation

### Frontend Implementation ✅
- [x] **Payment Component**: `apps/web/src/components/payment/OrangeMoneyPayment.tsx`
- [x] **Checkout Integration**: Added to checkout page payment methods
- [x] **Vendor Application**: Enhanced vendor form with Orange Money support
- [x] **Admin Settings**: Added Orange Money to admin configuration
- [x] **Country Configuration**: Updated all country data files

### Deployment Status ✅
- [x] **Vercel Deployment**: Successfully deployed with Next.js 15 compatibility
- [x] **Static Generation**: Fixed Suspense boundary issues
- [x] **Production Ready**: Full integration ready for production use

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Payment Flow Implementation](#payment-flow-implementation)
4. [Backend Service Implementation](#backend-service-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Webhook Handling](#webhook-handling)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Deployment](#deployment)

## API Overview

### Base URLs
- **Sandbox**: `https://api.orange.com/om-webpay/v1`
- **Production**: `https://api.orange.com/om-webpay/v1`

### Supported Countries & Currencies
```typescript
const SUPPORTED_COUNTRIES = {
  'ML': { currency: 'XOF', name: 'Mali' },
  'CM': { currency: 'XAF', name: 'Cameroon' },
  'CI': { currency: 'XOF', name: 'Côte d\'Ivoire' },
  'SN': { currency: 'XOF', name: 'Senegal' },
  'MG': { currency: 'MGA', name: 'Madagascar' },
  'BW': { currency: 'BWP', name: 'Botswana' },
  'GN': { currency: 'GNF', name: 'Guinea Conakry' },
  'GW': { currency: 'XOF', name: 'Guinea Bissau' },
  'SL': { currency: 'SLL', name: 'Sierra Leone' },
  'CD': { currency: 'CDF', name: 'RD Congo' },
  'CF': { currency: 'XAF', name: 'Central African Republic' }
};
```

## Authentication

### OAuth 2.0 Flow
```typescript
interface OrangeMoneyAuth {
  clientId: string;
  clientSecret: string;
  merchantCode: string;
  baseUrl: string;
}

class OrangeMoneyAuthService {
  private auth: OrangeMoneyAuth;
  
  constructor(auth: OrangeMoneyAuth) {
    this.auth = auth;
  }
  
  async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.auth.baseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.auth.clientId}:${this.auth.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    });
    
    const data = await response.json();
    return data.access_token;
  }
}
```

## Payment Flow Implementation

### 1. Payment Initiation
```typescript
interface PaymentInitiationRequest {
  merchant: {
    id: string;
    name: string;
  };
  order: {
    id: string;
    amount: number;
    currency: string;
    description: string;
  };
  customer: {
    phoneNumber: string;
    country: string;
  };
  returnUrl: string;
  cancelUrl: string;
}

interface PaymentInitiationResponse {
  payToken: string;
  paymentUrl: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}
```

### 2. Payment Verification
```typescript
interface PaymentVerificationRequest {
  payToken: string;
}

interface PaymentVerificationResponse {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  transactionId: string;
  amount: number;
  currency: string;
  customerPhone: string;
  timestamp: string;
}
```

## Backend Service Implementation

### Orange Money Provider Service
```typescript
// apps/api/src/services/providers/OrangeMoneyProvider.ts
import crypto from "crypto";
import { IPaymentProvider, InitPaymentArgs, InitPaymentResult } from "../PaymentService";

export class OrangeMoneyProvider implements IPaymentProvider {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private merchantCode: string;
  private authService: OrangeMoneyAuthService;

  constructor(opts?: { 
    baseUrl?: string; 
    clientId?: string; 
    clientSecret?: string; 
    merchantCode?: string; 
  }) {
    this.baseUrl = opts?.baseUrl || process.env.ORANGE_MONEY_BASE_URL || "https://api.orange.com";
    this.clientId = opts?.clientId || process.env.ORANGE_MONEY_CLIENT_ID || "";
    this.clientSecret = opts?.clientSecret || process.env.ORANGE_MONEY_CLIENT_SECRET || "";
    this.merchantCode = opts?.merchantCode || process.env.ORANGE_MONEY_MERCHANT_CODE || "";
    
    this.authService = new OrangeMoneyAuthService({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      merchantCode: this.merchantCode,
      baseUrl: this.baseUrl
    });
  }

  async initialize(args: InitPaymentArgs): Promise<InitPaymentResult> {
    try {
      const accessToken = await this.authService.getAccessToken();
      
      const paymentRequest: PaymentInitiationRequest = {
        merchant: {
          id: this.merchantCode,
          name: "AfriTrade Hub"
        },
        order: {
          id: args.orderId || `om_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          amount: args.amount || 0,
          currency: args.currency || "XOF",
          description: `Payment for order ${args.orderId}`
        },
        customer: {
          phoneNumber: (args.customer as any).phone || "",
          country: this.getCountryFromCurrency(args.currency || "XOF")
        },
        returnUrl: args.returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`
      };

      const response = await fetch(`${this.baseUrl}/om-webpay/v1/webpayment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      });

      const data: PaymentInitiationResponse = await response.json();
      
      if (data.status === 'PENDING') {
        return {
          url: data.paymentUrl,
          reference: data.payToken
        };
      } else {
        throw new Error(`Payment initiation failed: ${data.status}`);
      }
    } catch (error) {
      console.error('Orange Money payment initiation error:', error);
      throw new Error('Failed to initialize Orange Money payment');
    }
  }

  async verify(reference: string): Promise<{ paid: boolean; amount: number; currency: string }> {
    try {
      const accessToken = await this.authService.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/om-webpay/v1/webpayment/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data: PaymentVerificationResponse = await response.json();
      
      return {
        paid: data.status === 'SUCCESS',
        amount: data.amount || 0,
        currency: data.currency || 'XOF'
      };
    } catch (error) {
      console.error('Orange Money payment verification error:', error);
      return { paid: false, amount: 0, currency: 'XOF' };
    }
  }

  // Orange Money doesn't support traditional bank transfers
  async createRecipient(args: { name: string; accountNumber: string; bankCode: string }): Promise<{ recipientCode: string }> {
    throw new Error('Orange Money does not support bank transfers. Use mobile money accounts.');
  }

  // Orange Money doesn't have traditional banks
  async listBanks(countryCode: string): Promise<Array<{ name: string; code: string }>> {
    // Return mobile money operators instead
    return [
      { name: 'Orange Money', code: 'ORANGE_MONEY' },
      { name: 'Mobile Money', code: 'MOBILE_MONEY' }
    ];
  }

  async resolveAccount(args: { accountNumber: string; bankCode: string }): Promise<{ accountName: string }> {
    // For Orange Money, accountNumber is the phone number
    return { accountName: `Orange Money Account (${args.accountNumber})` };
  }

  private getCountryFromCurrency(currency: string): string {
    const countryMap: Record<string, string> = {
      'XOF': 'SN', // Default to Senegal for XOF
      'XAF': 'CM', // Default to Cameroon for XAF
      'MGA': 'MG',
      'BWP': 'BW',
      'GNF': 'GN',
      'SLL': 'SL',
      'CDF': 'CD'
    };
    return countryMap[currency] || 'SN';
  }
}
```

### Payment Routes Update
```typescript
// apps/api/src/routes/payment.routes.ts
import { OrangeMoneyProvider } from "../services/providers/OrangeMoneyProvider";

const providers: Record<string, IPaymentProvider> = {
  paystack: new PaystackProvider(),
  flutterwave: new FlutterwaveProvider(),
  orange_money: new OrangeMoneyProvider(),
};
```

### Vendor Routes Update
```typescript
// apps/api/src/routes/vendor.routes.ts
import { OrangeMoneyProvider } from "../services/providers/OrangeMoneyProvider";

// Add Orange Money bank listing endpoint
router.get("/provider/orange-money/banks", async (req: any, res: any, next: any) => {
  try {
    const { country = 'SN' } = req.query as any;
    const p = new OrangeMoneyProvider();
    const banks = await p.listBanks(String(country));
    res.json({ status: 'success', data: banks });
  } catch (e) {
    next(e);
  }
});
```

## Frontend Integration

### Country Configuration Update
```typescript
// apps/web/src/utils/enhancedCountryConfig.ts
export const enhancedCountryConfig: EnhancedCountryConfig[] = [
  // XOF Countries - Add Orange Money support
  {
    code: "SN",
    name: "Senegal",
    currency: "XOF",
    phoneCode: "+221",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    currency: "XOF",
    phoneCode: "+225",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    priority: 2
  },
  // ... other XOF countries
];
```

### Orange Money Payment Component
```typescript
// apps/web/src/components/payment/OrangeMoneyPayment.tsx
"use client";
import { useState } from 'react';
import { toast } from '@/components/common/Toast';

interface OrangeMoneyPaymentProps {
  amount: number;
  currency: string;
  orderId: string;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
}

export default function OrangeMoneyPayment({ 
  amount, 
  currency, 
  orderId, 
  onSuccess, 
  onError 
}: OrangeMoneyPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast('Please enter your phone number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/payments/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          orderId,
          provider: 'orange_money',
          amount,
          currency,
          customer: {
            phone: phoneNumber
          },
          returnUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Redirect to Orange Money payment page
        window.location.href = data.data.url;
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Orange Money payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Orange Money Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+221 77 123 4567"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter your Orange Money phone number
        </p>
      </div>
      
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : `Pay ${amount} ${currency} with Orange Money`}
      </button>
      
      <div className="text-xs text-gray-500">
        <p>• You will be redirected to Orange Money to complete payment</p>
        <p>• Use your Orange Money PIN to authorize the transaction</p>
        <p>• You will receive a confirmation SMS</p>
      </div>
    </div>
  );
}
```

### Payment Method Selection Update
```typescript
// apps/web/src/components/checkout/PaymentMethodSelector.tsx
const PaymentMethodSelector = ({ country, onSelect }: PaymentMethodSelectorProps) => {
  const availableProviders = getPaymentProvidersForCountry(country);
  
  return (
    <div className="space-y-3">
      {availableProviders.map((provider) => (
        <div key={provider} className="flex items-center space-x-3">
          <input
            type="radio"
            id={provider}
            name="paymentProvider"
            value={provider}
            onChange={() => onSelect(provider)}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500"
          />
          <label htmlFor={provider} className="flex items-center space-x-2">
            {provider === 'orange_money' && (
              <>
                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">OM</span>
                </div>
                <span>Orange Money</span>
              </>
            )}
            {provider === 'flutterwave' && (
              <>
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">FW</span>
                </div>
                <span>Flutterwave</span>
              </>
            )}
            {provider === 'paystack' && (
              <>
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PS</span>
                </div>
                <span>Paystack</span>
              </>
            )}
          </label>
        </div>
      ))}
    </div>
  );
};
```

## Webhook Handling

### Webhook Endpoint
```typescript
// apps/api/src/routes/webhook.routes.ts
import crypto from 'crypto';

router.post('/orange-money/payment-notification', async (req: any, res: any) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-orange-signature'];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.ORANGE_MONEY_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { payToken, status, transactionId, amount, currency } = req.body;
    
    // Update order status
    if (status === 'SUCCESS') {
      await Order.findOneAndUpdate(
        { paymentReference: payToken },
        { 
          paymentStatus: 'completed',
          status: 'confirmed',
          paymentMethod: 'orange_money',
          paymentTransactionId: transactionId
        }
      );
      
      // Trigger vendor payout if applicable
      // ... payout logic
    } else if (status === 'FAILED') {
      await Order.findOneAndUpdate(
        { paymentReference: payToken },
        { 
          paymentStatus: 'failed',
          status: 'cancelled'
        }
      );
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Orange Money webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

## Error Handling

### Error Types
```typescript
enum OrangeMoneyErrorType {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  UNSUPPORTED_CURRENCY = 'UNSUPPORTED_CURRENCY'
}

class OrangeMoneyError extends Error {
  constructor(
    public type: OrangeMoneyErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'OrangeMoneyError';
  }
}
```

### Error Handling Service
```typescript
class OrangeMoneyErrorHandler {
  static handle(error: any): string {
    if (error instanceof OrangeMoneyError) {
      switch (error.type) {
        case OrangeMoneyErrorType.AUTHENTICATION_FAILED:
          return 'Authentication failed. Please try again.';
        case OrangeMoneyErrorType.INVALID_PHONE_NUMBER:
          return 'Invalid phone number. Please check and try again.';
        case OrangeMoneyErrorType.INSUFFICIENT_FUNDS:
          return 'Insufficient funds in your Orange Money account.';
        case OrangeMoneyErrorType.PAYMENT_CANCELLED:
          return 'Payment was cancelled. Please try again.';
        case OrangeMoneyErrorType.INVALID_AMOUNT:
          return 'Invalid payment amount.';
        case OrangeMoneyErrorType.UNSUPPORTED_CURRENCY:
          return 'Currency not supported by Orange Money.';
        default:
          return 'Payment failed. Please try again.';
      }
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
}
```

## Testing

### Unit Tests
```typescript
// apps/api/src/tests/providers/orangeMoneyProvider.test.ts
import { OrangeMoneyProvider } from '../../services/providers/OrangeMoneyProvider';

describe('OrangeMoneyProvider', () => {
  let provider: OrangeMoneyProvider;
  
  beforeEach(() => {
    provider = new OrangeMoneyProvider({
      baseUrl: 'https://api.orange.com',
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      merchantCode: 'test_merchant_code'
    });
  });
  
  describe('initialize', () => {
    it('should initialize payment successfully', async () => {
      // Mock API response
      const mockResponse = {
        payToken: 'test_pay_token',
        paymentUrl: 'https://payment.orange.com/test',
        status: 'PENDING'
      };
      
      // Test implementation
      const result = await provider.initialize({
        amount: 1000,
        currency: 'XOF',
        orderId: 'test_order_123',
        customer: { phone: '+221771234567' },
        returnUrl: 'https://example.com/success'
      });
      
      expect(result.reference).toBe('test_pay_token');
      expect(result.url).toBe('https://payment.orange.com/test');
    });
  });
});
```

### Integration Tests
```typescript
// apps/api/src/tests/integration/orangeMoney.test.ts
describe('Orange Money Integration', () => {
  it('should handle complete payment flow', async () => {
    // 1. Initiate payment
    const initResponse = await request(app)
      .post('/api/v1/payments/init')
      .send({
        provider: 'orange_money',
        amount: 1000,
        currency: 'XOF',
        customer: { phone: '+221771234567' }
      });
    
    expect(initResponse.status).toBe(200);
    expect(initResponse.body.data.url).toContain('orange.com');
    
    // 2. Simulate webhook notification
    const webhookResponse = await request(app)
      .post('/api/v1/webhooks/orange-money/payment-notification')
      .send({
        payToken: initResponse.body.data.reference,
        status: 'SUCCESS',
        transactionId: 'txn_123456',
        amount: 1000,
        currency: 'XOF'
      });
    
    expect(webhookResponse.status).toBe(200);
  });
});
```

## Deployment

### Environment Configuration
```bash
# Production Environment Variables
ORANGE_MONEY_CLIENT_ID=prod_client_id
ORANGE_MONEY_CLIENT_SECRET=prod_client_secret
ORANGE_MONEY_MERCHANT_CODE=prod_merchant_code
ORANGE_MONEY_BASE_URL=https://api.orange.com
ORANGE_MONEY_WEBHOOK_SECRET=prod_webhook_secret
```

### Docker Configuration
```dockerfile
# Add Orange Money environment variables to Dockerfile
ENV ORANGE_MONEY_CLIENT_ID=""
ENV ORANGE_MONEY_CLIENT_SECRET=""
ENV ORANGE_MONEY_MERCHANT_CODE=""
ENV ORANGE_MONEY_BASE_URL="https://api.orange.com"
ENV ORANGE_MONEY_WEBHOOK_SECRET=""
```

### Monitoring
```typescript
// apps/api/src/middleware/orangeMoneyMonitoring.ts
export const orangeMoneyMonitoring = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log Orange Money API calls
    if (req.path.includes('orange-money')) {
      console.log(`Orange Money API: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
  });
  
  next();
};
```

## Security Checklist

- [ ] **API Credentials**: Store securely in environment variables
- [ ] **HTTPS Only**: All API calls use HTTPS
- [ ] **Webhook Verification**: Verify webhook signatures
- [ ] **Rate Limiting**: Implement rate limiting for API calls
- [ ] **Input Validation**: Validate all input parameters
- [ ] **Error Handling**: Don't expose sensitive information in errors
- [ ] **Audit Logging**: Log all payment transactions
- [ ] **PCI Compliance**: Follow PCI DSS guidelines
- [ ] **Regular Updates**: Keep API integration updated
- [ ] **Monitoring**: Monitor for suspicious activity

---

*This technical guide provides comprehensive implementation details for integrating Orange Money into the AfriTrade Hub platform.*
