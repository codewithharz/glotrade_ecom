// apps/web/src/hooks/useRealTimeWallet.ts
import { useEffect, useState, useCallback } from 'react';
import { getUserId } from '@/utils/auth';

interface WalletBalanceUpdate {
  currency: 'NGN' | 'ATH';
  available: number;
  frozen: number;
  total: number;
  lastUpdated: Date;
}

interface WalletTransactionUpdate {
  transactionId: string;
  type: string;
  amount: number;
  currency: 'NGN' | 'ATH';
  status: string;
  description: string;
  createdAt: Date;
}

interface WalletStatusUpdate {
  status: 'active' | 'frozen' | 'suspended';
  reason?: string;
  adminNotes?: string;
  updatedAt: Date;
  type: 'status_update';
}

interface RealTimeWalletEvent {
  type: 'wallet_balance_update' | 'wallet_transaction_update' | 'wallet_status_update';
  data: WalletBalanceUpdate | WalletTransactionUpdate | WalletStatusUpdate;
  timestamp: Date;
}

export const useRealTimeWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Connect to real-time updates (reuse existing notification connection)
  const connect = useCallback(() => {
    const userId = getUserId();
    if (!userId) return;

    // Instead of creating a new connection, listen to the existing notification stream
    // The useRealTimeNotifications hook should already be connected
    setIsConnected(true);
    console.log('Real-time wallet connection established (reusing notification stream)');
  }, []);

  // Disconnect from real-time updates
  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Listen for wallet balance updates
  const onBalanceUpdate = useCallback((callback: (data: WalletBalanceUpdate) => void) => {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };
    
    window.addEventListener('walletBalanceUpdate', handler as EventListener);
    
    return () => {
      window.removeEventListener('walletBalanceUpdate', handler as EventListener);
    };
  }, []);

  // Listen for transaction updates
  const onTransactionUpdate = useCallback((callback: (data: WalletTransactionUpdate) => void) => {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };
    
    window.addEventListener('walletTransactionUpdate', handler as EventListener);
    
    return () => {
      window.removeEventListener('walletTransactionUpdate', handler as EventListener);
    };
  }, []);

  // Listen for status updates
  const onStatusUpdate = useCallback((callback: (data: WalletStatusUpdate) => void) => {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };
    
    window.addEventListener('walletStatusUpdate', handler as EventListener);
    
    return () => {
      window.removeEventListener('walletStatusUpdate', handler as EventListener);
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
    connect,
    disconnect,
    onBalanceUpdate,
    onTransactionUpdate,
    onStatusUpdate
  };
};
