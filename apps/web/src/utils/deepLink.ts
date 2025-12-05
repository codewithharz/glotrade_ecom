// apps/web/src/utils/deepLink.ts

export interface WalletDeepLinkData {
  type: 'wallet_transfer' | 'wallet_profile' | 'wallet_qr';
  walletId: string;
  displayName?: string;
  amount?: number;
  currency?: 'NGN' | 'ATH';
  description?: string;
}

export class DeepLinkManager {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://afritrade-hub-web.vercel.app';
  
  /**
   * Generate a deep link for wallet sharing
   */
  static generateWalletLink(data: WalletDeepLinkData): string {
    const params = new URLSearchParams();
    
    params.set('type', data.type);
    params.set('walletId', data.walletId);
    
    if (data.displayName) {
      params.set('displayName', data.displayName);
    }
    
    if (data.amount) {
      params.set('amount', data.amount.toString());
    }
    
    if (data.currency) {
      params.set('currency', data.currency);
    }
    
    if (data.description) {
      params.set('description', data.description);
    }
    
    return `${this.baseUrl}/wallet/share?${params.toString()}`;
  }
  
  /**
   * Parse deep link data from URL parameters
   */
  static parseWalletLink(searchParams: URLSearchParams): WalletDeepLinkData | null {
    const type = searchParams.get('type');
    const walletId = searchParams.get('walletId');
    
    if (!type || !walletId) {
      return null;
    }
    
    const data: WalletDeepLinkData = {
      type: type as WalletDeepLinkData['type'],
      walletId
    };
    
    const displayName = searchParams.get('displayName');
    if (displayName) {
      data.displayName = displayName;
    }
    
    const amount = searchParams.get('amount');
    if (amount) {
      data.amount = parseFloat(amount);
    }
    
    const currency = searchParams.get('currency');
    if (currency && (currency === 'NGN' || currency === 'ATH')) {
      data.currency = currency;
    }
    
    const description = searchParams.get('description');
    if (description) {
      data.description = description;
    }
    
    return data;
  }
  
  /**
   * Generate QR code data for deep linking
   */
  static generateQRData(data: WalletDeepLinkData): string {
    return JSON.stringify({
      type: 'wallet_deep_link',
      url: this.generateWalletLink(data),
      walletId: data.walletId,
      displayName: data.displayName,
      amount: data.amount,
      currency: data.currency,
      description: data.description
    });
  }
  
  /**
   * Parse QR code data for deep linking
   */
  static parseQRData(qrData: string): WalletDeepLinkData | null {
    try {
      const parsed = JSON.parse(qrData);
      
      if (parsed.type === 'wallet_deep_link' && parsed.url) {
        const url = new URL(parsed.url);
        return this.parseWalletLink(url.searchParams);
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing QR data:', error);
      return null;
    }
  }
  
  /**
   * Share wallet link using Web Share API or fallback
   */
  static async shareWalletLink(data: WalletDeepLinkData, text?: string): Promise<boolean> {
    const link = this.generateWalletLink(data);
    const shareText = text || `Send money to ${data.displayName || data.walletId} via Afritrade Wallet`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Afritrade Wallet',
          text: shareText,
          url: link
        });
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(link);
        return true;
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
      }
    }
  }
  
  /**
   * Copy wallet link to clipboard
   */
  static async copyWalletLink(data: WalletDeepLinkData): Promise<boolean> {
    try {
      const link = this.generateWalletLink(data);
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
}
