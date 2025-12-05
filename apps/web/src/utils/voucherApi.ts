import { API_BASE_URL } from "./api";

export interface Voucher {
  _id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUsage: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableUsers?: string[];
  userUsageLimit: number;
  description?: string;
  terms?: string;
}

export interface ValidateVoucherResult {
  isValid: boolean;
  voucher?: Voucher;
  error?: string;
  discountAmount?: number;
}

export interface AppliedVoucher {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  discountAmount: number;
  description?: string;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('afritrade:auth');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Validate a voucher code
export async function validateVoucher(
  code: string, 
  orderAmount: number, 
  productIds?: string[]
): Promise<ValidateVoucherResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/vouchers/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        code,
        orderAmount,
        productIds
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        isValid: false,
        error: errorData.message || 'Failed to validate voucher'
      };
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error validating voucher:', error);
    return {
      isValid: false,
      error: 'Network error occurred'
    };
  }
}

// Get available vouchers for the current user
export async function getAvailableVouchers(): Promise<Voucher[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/vouchers/available`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vouchers: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching available vouchers:', error);
    return [];
  }
}

// Redeem a voucher
export async function redeemVoucher(code: string, orderId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/vouchers/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        code,
        orderId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to redeem voucher');
    }

    return true;
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    throw error;
  }
}

// Record voucher usage when applied during checkout
export async function recordVoucherUsage(code: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/vouchers/record-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        code
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to record voucher usage');
    }

    return true;
  } catch (error) {
    console.error('Error recording voucher usage:', error);
    throw error;
  }
}

// Calculate discount amount for a voucher
export function calculateVoucherDiscount(
  voucher: Voucher, 
  orderAmount: number
): number {
  switch (voucher.type) {
    case 'percentage':
      const percentageDiscount = (orderAmount * voucher.value) / 100;
      if (voucher.maxDiscount) {
        return Math.min(percentageDiscount, voucher.maxDiscount);
      }
      return percentageDiscount;
    
    case 'fixed':
      return Math.min(voucher.value, orderAmount);
    
    case 'free_shipping':
      // This would need shipping cost from the order
      return 0; // Placeholder
    
    default:
      return 0;
  }
} 