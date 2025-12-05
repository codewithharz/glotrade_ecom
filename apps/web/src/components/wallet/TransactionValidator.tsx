"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/utils/api";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  DollarSign,
  User,
  Hash,
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";

interface TransactionValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recipientInfo: {
    isVerified: boolean;
    kycLevel: number;
    lastSeen: string;
    accountAge: number;
    transactionHistory: {
      totalTransactions: number;
      totalAmount: number;
      averageAmount: number;
      lastTransaction: string;
    };
  };
  amountValidation: {
    isWithinLimits: boolean;
    dailyLimit: number;
    remainingDailyLimit: number;
    monthlyLimit: number;
    remainingMonthlyLimit: number;
  };
  securityChecks: {
    isRecipientBlocked: boolean;
    isSuspiciousActivity: boolean;
    isHighRiskAmount: boolean;
    isNewRecipient: boolean;
  };
}

interface TransactionValidatorProps {
  recipientId: string;
  amount: number;
  currency: string;
  onValidationComplete: (validation: TransactionValidation) => void;
  onClose: () => void;
}

export default function TransactionValidator({ 
  recipientId, 
  amount, 
  currency, 
  onValidationComplete, 
  onClose 
}: TransactionValidatorProps) {
  const [validation, setValidation] = useState<TransactionValidation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  // Validate transaction
  useEffect(() => {
    if (hasValidated) return; // Prevent multiple validations
    
    const validateTransaction = async () => {
      try {
        setIsLoading(true);
        
        // Call real validation API
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        
        // Get auth header using the same method as other parts of the app
        const getAuthHeader = () => {
          try {
            const jwtToken = localStorage.getItem("afritrade:auth") || localStorage.getItem("afritrade:jwt") || localStorage.getItem("jwt") || localStorage.getItem("token");
            if (jwtToken) {
              return { Authorization: `Bearer ${jwtToken}` };
            }
            
            const raw = localStorage.getItem("afritrade:user") || localStorage.getItem("user");
            if (raw) {
              const obj = JSON.parse(raw);
              if (obj?.token) {
                return { Authorization: `Bearer ${obj.token}` };
              }
              if (obj?.jwt) {
                return { Authorization: `Bearer ${obj.jwt}` };
              }
              const id = obj?.id || obj?._id || obj?.userId || obj?.user?.id || obj?.user?._id || obj?.address;
              if (id) {
                return { Authorization: `Bearer ${id}` };
              }
            }
            return {};
          } catch (error) {
            return {};
          }
        };
        
        const authHeader = getAuthHeader();
        console.log('Auth header for validation:', authHeader);
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (authHeader.Authorization) {
          headers.Authorization = authHeader.Authorization;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/v1/wallets/validate-transfer`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            recipientId,
            amount: amount.toString(),
            currency
          })
        });
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
          console.error('Validation API error:', response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Validation API response:', data);
        
        if (data.status === "success") {
          const validation: TransactionValidation = data.data;
          console.log('Validation data:', validation);
          setValidation(validation);
          setHasValidated(true);
          onValidationComplete(validation);
        } else {
          console.error('Validation failed:', data.message || "Unknown error");
          throw new Error(data.message || "Validation failed");
        }
      } catch (error) {
        console.error("Error validating transaction:", error);
        // Set error state
        const errorValidation: TransactionValidation = {
          isValid: false,
          warnings: [],
          errors: ["Failed to validate transaction"],
          suggestions: ["Please try again or contact support"],
          riskLevel: 'high',
          recipientInfo: {
            isVerified: false,
            kycLevel: 0,
            lastSeen: '',
            accountAge: 0,
            transactionHistory: {
              totalTransactions: 0,
              totalAmount: 0,
              averageAmount: 0,
              lastTransaction: ''
            }
          },
          amountValidation: {
            isWithinLimits: false,
            dailyLimit: 0,
            remainingDailyLimit: 0,
            monthlyLimit: 0,
            remainingMonthlyLimit: 0
          },
          securityChecks: {
            isRecipientBlocked: false,
            isSuspiciousActivity: false,
            isHighRiskAmount: false,
            isNewRecipient: false
          }
        };
        setValidation(errorValidation);
        setHasValidated(true);
      } finally {
        setIsLoading(false);
      }
    };

    validateTransaction();
  }, [recipientId, amount, currency, onValidationComplete]);

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 100).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Validating Transaction
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we verify the transaction details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getRiskColor(validation.riskLevel)}`}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transaction Validation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {validation.isValid ? 'Transaction approved' : 'Transaction requires attention'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={showDetails ? "Hide details" : "Show details"}
            >
              {showDetails ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Validation Result */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            {validation.isValid ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            )}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {validation.isValid ? 'Transaction Approved' : 'Transaction Blocked'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Amount: {formatCurrency(amount)} • Risk Level: {validation.riskLevel.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Errors */}
          {validation.errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Errors</h5>
              <ul className="space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Warnings</h5>
              <ul className="space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {validation.suggestions.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Suggestions</h5>
              <ul className="space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Information */}
          {showDetails && (
            <div className="space-y-4">
              {/* Recipient Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Recipient Information
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Verification:</span>
                    <span className={`ml-2 ${validation.recipientInfo.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.recipientInfo.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">KYC Level:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {validation.recipientInfo.kycLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Account Age:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {validation.recipientInfo.accountAge} days
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Last Seen:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatDate(validation.recipientInfo.lastSeen)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Transaction History
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total Transactions:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {validation.recipientInfo.transactionHistory.totalTransactions}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatCurrency(validation.recipientInfo.transactionHistory.totalAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Average Amount:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatCurrency(validation.recipientInfo.transactionHistory.averageAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Last Transaction:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatDate(validation.recipientInfo.transactionHistory.lastTransaction)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Validation */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount Validation
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Daily Limit:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatCurrency(validation.amountValidation.dailyLimit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatCurrency(validation.amountValidation.remainingDailyLimit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Monthly Limit:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatCurrency(validation.amountValidation.monthlyLimit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatCurrency(validation.amountValidation.remainingMonthlyLimit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {validation.isValid ? 'Continue' : 'Cancel'}
            </button>
            {validation.isValid && (
              <button
                onClick={() => {
                  // Proceed with transaction
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed with Transaction
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
