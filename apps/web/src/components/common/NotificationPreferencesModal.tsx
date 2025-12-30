"use client";

import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { translate, Locale } from '@/utils/i18n';

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

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: NotificationPreferences) => void;
  initialPreferences?: NotificationPreferences;
  locale: Locale;
}

export default function NotificationPreferencesModal({
  isOpen,
  onClose,
  onSave,
  initialPreferences,
  locale
}: NotificationPreferencesModalProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialPreferences || {
      channels: {
        in_app: true,
        email: true,
        push: true,
        sms: false,
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
        promotions: true,
      },
      frequency: 'immediate',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    }
  );

  const handlePreferenceChange = (category: keyof NotificationPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as Record<string, any>),
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {translate(locale, "notifications.modalTitle")}
                </h2>
                <p className="text-sm text-gray-600">
                  {translate(locale, "notifications.modalDesc")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Delivery Channels */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {translate(locale, "notifications.deliveryChannels")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(preferences.channels).map(([channel, enabled]) => (
                  <label key={channel} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handlePreferenceChange('channels', channel, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {channel.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {translate(locale, "notifications.notificationTypes")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(preferences.types).map(([type, enabled]) => (
                  <label key={type} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handlePreferenceChange('types', type, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {translate(locale, "notifications.updateFrequency")}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {['immediate', 'daily', 'weekly'].map((freq) => (
                  <label key={freq} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      checked={preferences.frequency === freq}
                      onChange={() => handlePreferenceChange('frequency', 'frequency', freq)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {freq}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {translate(locale, "notifications.quietHours")}
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => handlePreferenceChange('quietHours', 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {translate(locale, "notifications.enableQuietHours")}
                  </span>
                </label>

                {preferences.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-7">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translate(locale, "notifications.startTime")}
                      </label>
                      <input
                        type="time"
                        value={preferences.quietHours.start}
                        onChange={(e) => handlePreferenceChange('quietHours', 'start', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translate(locale, "notifications.endTime")}
                      </label>
                      <input
                        type="time"
                        value={preferences.quietHours.end}
                        onChange={(e) => handlePreferenceChange('quietHours', 'end', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {translate(locale, "common.cancel")}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {translate(locale, "notifications.savePreferences")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}