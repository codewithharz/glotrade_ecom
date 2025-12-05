import crypto from "crypto";
import { IPaymentProvider, InitPaymentArgs, InitPaymentResult } from "../PaymentService";

// Orange Money Authentication Service
class OrangeMoneyAuthService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private merchantCode: string;

  constructor(auth: {
    baseUrl: string;
    clientId: string;
    clientSecret: string;
    merchantCode: string;
  }) {
    this.baseUrl = auth.baseUrl;
    this.clientId = auth.clientId;
    this.clientSecret = auth.clientSecret;
    this.merchantCode = auth.merchantCode;
  }

  async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials'
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { access_token?: string };
      
      if (!data.access_token) {
        throw new Error('No access token received from Orange Money API');
      }

      return data.access_token;
    } catch (error) {
      console.error('Orange Money authentication error:', error);
      throw new Error('Failed to authenticate with Orange Money API');
    }
  }
}

// Orange Money Payment Interfaces
interface OrangeMoneyPaymentRequest {
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

interface OrangeMoneyPaymentResponse {
  payToken: string;
  paymentUrl: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  message?: string;
}

interface OrangeMoneyVerificationResponse {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  transactionId: string;
  amount: number;
  currency: string;
  customerPhone: string;
  timestamp: string;
  errorCode?: string;
  errorMessage?: string;
}

// Orange Money Provider Implementation
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
    
    if (!this.clientId || !this.clientSecret || !this.merchantCode) {
      console.warn("Orange Money credentials not fully configured. Set ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET, and ORANGE_MONEY_MERCHANT_CODE");
    }

    this.authService = new OrangeMoneyAuthService({
      baseUrl: this.baseUrl,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      merchantCode: this.merchantCode
    });
  }

  async initialize(args: InitPaymentArgs): Promise<InitPaymentResult> {
    try {
      const accessToken = await this.authService.getAccessToken();
      
      const paymentRequest: OrangeMoneyPaymentRequest = {
        merchant: {
          id: this.merchantCode,
          name: "AfriTrade Hub"
        },
        order: {
          id: args.orderId || `om_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          amount: args.amount || 0,
          currency: args.currency || "XOF",
          description: `Payment for order ${args.orderId || 'unknown'}`
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

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Orange Money payment initiation failed (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json() as OrangeMoneyPaymentResponse;
      
      if (data.status === 'PENDING' && data.paymentUrl && data.payToken) {
        return {
          url: data.paymentUrl,
          reference: data.payToken
        };
      } else {
        throw new Error(`Payment initiation failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Orange Money payment initiation error:', error);
      throw new Error(`Failed to initialize Orange Money payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      if (!response.ok) {
        console.warn(`Orange Money verification failed for reference ${reference}: ${response.status}`);
        return { paid: false, amount: 0, currency: 'XOF' };
      }

      const data = await response.json() as OrangeMoneyVerificationResponse;
      
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
    throw new Error('Orange Money does not support bank transfers. Use mobile money accounts instead.');
  }

  // Orange Money doesn't have traditional banks - return mobile money operators
  async listBanks(countryCode: string): Promise<Array<{ name: string; code: string }>> {
    try {
      // Return mobile money operators instead of traditional banks
      const mobileMoneyOperators = [
        { name: 'Orange Money', code: 'ORANGE_MONEY' },
        { name: 'Mobile Money', code: 'MOBILE_MONEY' }
      ];

      // Add country-specific operators if available
      const countryOperators: Record<string, Array<{ name: string; code: string }>> = {
        'SN': [{ name: 'Orange Money Senegal', code: 'ORANGE_MONEY_SN' }],
        'CI': [{ name: 'Orange Money Côte d\'Ivoire', code: 'ORANGE_MONEY_CI' }],
        'ML': [{ name: 'Orange Money Mali', code: 'ORANGE_MONEY_ML' }],
        'CM': [{ name: 'Orange Money Cameroon', code: 'ORANGE_MONEY_CM' }],
        'MG': [{ name: 'Orange Money Madagascar', code: 'ORANGE_MONEY_MG' }],
        'BW': [{ name: 'Orange Money Botswana', code: 'ORANGE_MONEY_BW' }],
        'GN': [{ name: 'Orange Money Guinea', code: 'ORANGE_MONEY_GN' }],
        'GW': [{ name: 'Orange Money Guinea Bissau', code: 'ORANGE_MONEY_GW' }],
        'SL': [{ name: 'Orange Money Sierra Leone', code: 'ORANGE_MONEY_SL' }],
        'CD': [{ name: 'Orange Money RD Congo', code: 'ORANGE_MONEY_CD' }],
        'CF': [{ name: 'Orange Money Central African Republic', code: 'ORANGE_MONEY_CF' }]
      };

      const countrySpecific = countryOperators[countryCode] || [];
      return [...mobileMoneyOperators, ...countrySpecific];
    } catch (error) {
      console.error('Orange Money listBanks error:', error);
      return [{ name: 'Orange Money', code: 'ORANGE_MONEY' }];
    }
  }

  async resolveAccount(args: { accountNumber: string; bankCode: string }): Promise<{ accountName: string }> {
    try {
      // For Orange Money, accountNumber is the phone number
      // Validate phone number format
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(args.accountNumber)) {
        throw new Error('Invalid phone number format');
      }

      return { 
        accountName: `Orange Money Account (${args.accountNumber})` 
      };
    } catch (error) {
      console.error('Orange Money resolveAccount error:', error);
      throw new Error('Failed to resolve Orange Money account');
    }
  }

  private getCountryFromCurrency(currency: string): string {
    const currencyToCountry: Record<string, string> = {
      'XOF': 'SN', // Default to Senegal for XOF
      'XAF': 'CM', // Default to Cameroon for XAF
      'MGA': 'MG',
      'BWP': 'BW',
      'GNF': 'GN',
      'SLL': 'SL',
      'CDF': 'CD'
    };
    return currencyToCountry[currency] || 'SN';
  }

  // Helper method to get supported countries
  static getSupportedCountries(): Array<{ code: string; name: string; currency: string }> {
    return [
      { code: 'SN', name: 'Senegal', currency: 'XOF' },
      { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF' },
      { code: 'ML', name: 'Mali', currency: 'XOF' },
      { code: 'CM', name: 'Cameroon', currency: 'XAF' },
      { code: 'MG', name: 'Madagascar', currency: 'MGA' },
      { code: 'BW', name: 'Botswana', currency: 'BWP' },
      { code: 'GN', name: 'Guinea Conakry', currency: 'GNF' },
      { code: 'GW', name: 'Guinea Bissau', currency: 'XOF' },
      { code: 'SL', name: 'Sierra Leone', currency: 'SLL' },
      { code: 'CD', name: 'RD Congo', currency: 'CDF' },
      { code: 'CF', name: 'Central African Republic', currency: 'XAF' }
    ];
  }
}
