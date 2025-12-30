"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Archive, Trash2, Settings } from 'lucide-react';
// No useAuth hook needed - using localStorage directly like other components
import { API_BASE_URL, apiGet, apiPost, apiPatch, apiDelete } from '@/utils/api';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import NotificationPreferencesModal from '@/components/common/NotificationPreferencesModal';
// i18n imports
import { getStoredLocale, Locale, translate } from "@/utils/i18n";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  data?: Record<string, any>;
}

interface NotificationBellProps {
  className?: string;
}

interface NotificationPreferences {
  channels: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  types: {
    order_placed: boolean;
    order_confirmed: boolean;
    order_processing: boolean;
    order_shipped: boolean;
    order_delivered: boolean;
    payment_confirmed: boolean;
    payment_failed: boolean;
    product_updates: boolean;
    security_alerts: boolean;
    promotions: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");

  // Refs for outside click detection
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Initialize locale
  useEffect(() => {
    setLocale(getStoredLocale());

    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () =>
      window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  // Get user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("afritrade:user");
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }
  }, []);

  // Fetch notifications and unread count
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
      loadUserPreferences();
    }
  }, [user?.id]);

  // Close on outside click / escape key
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!isOpen) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // Real-time notification updates - only connect when user exists
  const { } = useRealTimeNotifications(
    user?.id ? {
      onNotification: (newNotification) => {
        // Add new notification to the top of the list
        setNotifications(prev => [newNotification, ...prev]);
        // Increment unread count
        setUnreadCount(prev => prev + 1);
      },
      onStatusUpdate: (data) => {
        // Update notification status
        setNotifications(prev =>
          prev.map(n =>
            n._id === data.notificationId
              ? { ...n, status: data.status as 'unread' | 'read' | 'archived' }
              : n
          )
        );
      },
      onCountUpdate: (data) => {
        // Update unread count
        setUnreadCount(data.unreadCount);
      },
      onConnectionChange: (connected) => {
        // Connection status changes - only log in development
        if (process.env.NODE_ENV === 'development') {
          if (connected) {
            console.log('Real-time notifications connected');
          } else {
            console.log('Real-time notifications disconnected');
          }
        }
      },
      onError: (error) => {
        console.error('Real-time notification error:', error);
      }
    } : undefined
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ status: string; data: { notifications: Notification[] } }>("/api/v1/notifications?limit=20");
      setNotifications(data.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await apiGet<{ status: string; data: { unreadCount: number } }>("/api/v1/notifications/unread-count");
      setUnreadCount(data.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiPatch(`/api/v1/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, status: 'read' as const } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiPost("/api/v1/notifications/mark-all-read");
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' as const }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      await apiPatch(`/api/v1/notifications/${notificationId}/archive`);
      // Remove from local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      // Update unread count if it was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await apiDelete(`/api/v1/notifications/${notificationId}`);
      // Remove from local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      // Update unread count if it was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-500';
      case 'read': return 'bg-gray-400';
      case 'archived': return 'bg-gray-300';
      default: return 'bg-gray-400';
    }
  };

  // Notification preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    channels: {
      in_app: true,
      email: true,
      push: false,
      sms: false
    },
    types: {
      order_placed: true,
      order_confirmed: true,
      order_processing: true,
      order_shipped: true,
      order_delivered: true,
      payment_confirmed: true,
      payment_failed: true,
      product_updates: true,
      security_alerts: true,
      promotions: false
    },
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });



  // Load user preferences
  const loadUserPreferences = async () => {
    try {
      const data = await apiGet<{ status: string; data: { preferences: NotificationPreferences } }>("/api/v1/user-preferences");
      setPreferences(data.data.preferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      console.log('Saving preferences:', preferences);

      const data = await apiPost<{ status: string; data: any }>("/api/v1/user-preferences", { preferences });
      console.log('Preferences saved successfully:', data);
      setShowPreferences(false);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // You could add a toast notification here for errors
    }
  };

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => n.status === 'unread')
    : notifications;

  if (!user?.id) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={translate(locale, "notifications.title")}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* overlay for mobile to prevent off-canvas interactions */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          <div
            ref={menuRef}
            className="fixed md:absolute left-1/2 md:left-auto md:right-0 -translate-x-1/2 md:translate-x-0 top-[68px] md:top-full md:mt-2 z-50 w-[94vw] md:w-96 max-w-[380px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-200 gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {translate(locale, "notifications.title")}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {unreadCount} {translate(locale, "notifications.new")}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed px-2 py-1 rounded hover:bg-blue-50"
                >
                  {translate(locale, "notifications.markAllRead")}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {translate(locale, "notifications.all")}
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'unread'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {translate(locale, "notifications.unread")} ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-3 sm:p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm">{translate(locale, "notifications.loading")}</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-3 sm:p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm">
                    {activeTab === 'unread'
                      ? translate(locale, "notifications.noUnread")
                      : translate(locale, "notifications.noNotifications")}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${notification.status === 'unread' ? 'bg-blue-50' : ''
                      }`}
                  >
                    {/* Notification Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(notification.status)}`} />
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {notification.status === 'unread' && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                            title={translate(locale, "notifications.markAsRead")}
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => archiveNotification(notification._id)}
                          className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                          title={translate(locale, "notifications.archive")}
                        >
                          <Archive className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                          title={translate(locale, "notifications.delete")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                        {notification.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>

                    {/* Notification Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="truncate">{notification.type.replace(/_/g, ' ')}</span>
                      <span className="text-xs">{new Date(notification.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <button
                  onClick={() => window.location.href = '/profile/notifications'}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-2 rounded hover:bg-blue-50 text-center"
                >
                  {translate(locale, "notifications.viewAll")}
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  {translate(locale, "notifications.preferences")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={savePreferences}
        initialPreferences={preferences}
        locale={locale}
      />
    </div>
  );
}