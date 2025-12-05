"use client";

import React from 'react';
import { X, AlertTriangle, Wallet, CreditCard } from 'lucide-react';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount: number;
  availableAmount: number;
  currency: string;
  onAddFunds?: () => void;
  onUseOtherPayment?: () => void;
}

const InsufficientBalanceModal: React.FC<InsufficientBalanceModalProps> = ({
  isOpen,
  onClose,
  requiredAmount,
  availableAmount,
  currency,
  onAddFunds,
  onUseOtherPayment
}) => {
  if (!isOpen) return null;

  const shortfall = requiredAmount - availableAmount;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Insufficient Balance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Balance Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Required Amount
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₦{requiredAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Available Balance
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₦{availableAmount.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Shortfall
                    </span>
                    <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                      ₦{shortfall.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your wallet doesn't have enough funds to complete this payment.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {onAddFunds && (
              <button
                onClick={onAddFunds}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Wallet className="w-4 h-4" />
                Add Funds to Wallet
              </button>
            )}

            {onUseOtherPayment && (
              <button
                onClick={onUseOtherPayment}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Use Other Payment Method
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientBalanceModal;
