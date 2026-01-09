// apps/web/src/hooks/useRealTimeNotifications.ts
import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '@/utils/api';

export interface RealTimeNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  data?: Record<string, any>;
}

export interface RealTimeEvent {
  type: 'notification' | 'status_update' | 'count_update' | 'connection' | 'heartbeat' | 'system_message' | 'wallet_balance_update' | 'wallet_transaction_update' | 'wallet_status_update';
  data: any;
  timestamp: string;
}

export interface UseRealTimeNotificationsOptions {
  onNotification?: (notification: RealTimeNotification) => void;
  onStatusUpdate?: (data: { notificationId: string; status: string }) => void;
  onCountUpdate?: (data: { unreadCount: number }) => void;
  onWalletBalanceUpdate?: (data: { currency: 'NGN' | 'ATH'; available: number; frozen: number; total: number; lastUpdated: Date }) => void;
  onWalletTransactionUpdate?: (data: { transactionId: string; type: string; amount: number; currency: 'NGN' | 'ATH'; status: string; description: string; createdAt: Date }) => void;
  onWalletStatusUpdate?: (data: { status: 'active' | 'frozen' | 'suspended'; reason?: string; adminNotes?: string; updatedAt: Date; type: 'status_update' }) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useRealTimeNotifications(options?: UseRealTimeNotificationsOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const {
    onNotification,
    onStatusUpdate,
    onCountUpdate,
    onWalletBalanceUpdate,
    onWalletTransactionUpdate,
    onWalletStatusUpdate,
    onConnectionChange,
    onError,
    autoReconnect = true,
    reconnectInterval = 5000
  } = options || {};

  const connect = useCallback(() => {
    // Don't connect if no options provided
    if (!options) {
      console.log('No options provided, skipping real-time connection');
      return;
    }

    try {
      // Get auth token
      const token = localStorage.getItem('afritrade:auth');
      if (!token) {
        console.warn('No auth token found for real-time notifications');
        return;
      }

      // Add a small delay to ensure the page is fully loaded
      // Use exponential backoff for reconnections
      const delay = reconnectAttemptsRef.current > 0
        ? Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000) // Max 30s
        : 1000;

      setTimeout(() => {
        establishConnection();
      }, delay);
    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      onError?.(error as Event);
    }
  }, [onNotification, onStatusUpdate, onCountUpdate, onConnectionChange, onError, autoReconnect, reconnectInterval]);

  const establishConnection = useCallback(() => {
    try {
      // Get auth token
      const token = localStorage.getItem('afritrade:auth');
      if (!token) {
        console.warn('No auth token found for real-time notifications');
        return;
      }

      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new EventSource with token as query parameter (EventSource doesn't support headers)
      const url = `${API_BASE_URL}/api/v1/realtime/notifications/stream?token=${encodeURIComponent(token)}`;
      console.log('Connecting to real-time notifications:', url);
      eventSourceRef.current = new EventSource(url);

      // Set up connection timeout (Vercel has 10s limit for serverless functions)
      // If no heartbeat received within 15s, reconnect
      let heartbeatTimeout: NodeJS.Timeout;
      const resetHeartbeat = () => {
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
        heartbeatTimeout = setTimeout(() => {
          console.log('No heartbeat received, reconnecting...');
          if (autoReconnect && eventSourceRef.current) {
            eventSourceRef.current.close();
            connect();
          }
        }, 15000);
      };

      // Connection opened
      eventSourceRef.current.onopen = () => {
        // console.log('Real-time notification connection opened successfully');
        isConnectedRef.current = true;
        reconnectAttemptsRef.current = 0;
        onConnectionChange?.(true);
        resetHeartbeat();
      };

      // Message received
      eventSourceRef.current.onmessage = (event) => {
        try {
          const data: RealTimeEvent = JSON.parse(event.data);

          switch (data.type) {
            case 'notification':
              onNotification?.(data.data);
              resetHeartbeat();
              break;
            case 'status_update':
              onStatusUpdate?.(data.data);
              resetHeartbeat();
              break;
            case 'count_update':
              onCountUpdate?.(data.data);
              resetHeartbeat();
              break;
            case 'wallet_balance_update':
              onWalletBalanceUpdate?.(data.data);
              resetHeartbeat();
              break;
            case 'wallet_transaction_update':
              onWalletTransactionUpdate?.(data.data);
              resetHeartbeat();
              break;
            case 'wallet_status_update':
              onWalletStatusUpdate?.(data.data);
              resetHeartbeat();
              break;
            case 'connection':
              // Connection established - no need to log for production
              resetHeartbeat();
              break;
            case 'heartbeat':
              // Heartbeat received, connection is alive
              resetHeartbeat();
              break;
            case 'system_message':
              console.log('System message:', data.data);
              resetHeartbeat();
              break;
            default:
              console.log('Unknown event type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse real-time event:', error);
        }
      };

      // Connection error
      eventSourceRef.current.onerror = (error) => {
        console.error('Real-time notification connection error:', error);
        isConnectedRef.current = false;
        onConnectionChange?.(false);

        // Clear heartbeat timeout
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);

        // Don't show error to user if it's just a connection issue
        if (eventSourceRef.current?.readyState === EventSource.CONNECTING) {
          console.log('Connection in progress...');
          return;
        }

        onError?.(error);

        // Attempt to reconnect with exponential backoff
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      onError?.(error as Event);
    }
  }, [onNotification, onStatusUpdate, onCountUpdate, onConnectionChange, onError, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    isConnectedRef.current = false;
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  // Auto-connect on mount only when options are provided
  useEffect(() => {
    if (options) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, options]);

  // Cleanup reconnect timeout on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected: isConnectedRef.current,
    connect,
    disconnect,
    reconnect
  };
} 