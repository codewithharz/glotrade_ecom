"use client";
import { useState, useEffect } from "react";
import { RequireAuth } from "@/components/auth/Guards";
import { apiGet } from "@/utils/api";
import { getUserId } from "@/utils/auth";
import { toast } from "@/components/common/Toast";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  PieChart,
  Activity,
  Clock,
  Target,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface AnalyticsData {
  period: string;
  currency: string;
  type: string;
  summary: {
    totalTransactions: number;
    totalVolume: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalTransfers: number;
    avgTransactionAmount: number;
    avgDailyVolume: number;
  };
  balanceHistory: Array<{
    currency: string;
    balance: number;
    frozenBalance: number;
    total: number;
    date: string;
  }>;
  spendingPatterns: {
    mostActiveDay: string;
    mostActiveHour: number;
    avgTransactionSize: number;
    largestTransaction: number;
    smallestTransaction: number;
  };
  generatedAt: string;
}

interface SpendingInsights {
  period: string;
  currency: string;
  category: string;
  totalSpent: number;
  avgSpending: number;
  transactionCount: number;
  categorySpending: Array<{ category: string; amount: number }>;
  dayOfWeekSpending: Array<{ day: string; amount: number }>;
  spendingTrends: Array<{ date: string; amount: number }>;
  generatedAt: string;
}

interface TransactionTrends {
  period: string;
  currency: string;
  granularity: string;
  trends: Array<{
    period: string;
    count: number;
    volume: number;
    deposits: number;
    withdrawals: number;
  }>;
  generatedAt: string;
}

export default function WalletAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [spendingInsights, setSpendingInsights] = useState<SpendingInsights | null>(null);
  const [trends, setTrends] = useState<TransactionTrends | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: "30d",
    currency: "all",
    type: "all",
    category: "all",
    granularity: "daily"
  });
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Set default filter state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint
        setIsFiltersExpanded(true);
      } else {
        setIsFiltersExpanded(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const userId = getUserId();
      if (!userId) return;

      const [analyticsRes, spendingRes, trendsRes] = await Promise.all([
        apiGet(`/api/v1/wallets/analytics?period=${filters.period}&currency=${filters.currency}&type=${filters.type}`) as Promise<{ status: string; data: AnalyticsData }>,
        apiGet(`/api/v1/wallets/analytics/spending?period=${filters.period}&currency=${filters.currency}&category=${filters.category}`) as Promise<{ status: string; data: SpendingInsights }>,
        apiGet(`/api/v1/wallets/analytics/trends?period=${filters.period}&currency=${filters.currency}&granularity=${filters.granularity}`) as Promise<{ status: string; data: TransactionTrends }>
      ]);

      if (analyticsRes.status === "success") {
        setAnalytics(analyticsRes.data);
      }
      if (spendingRes.status === "success") {
        setSpendingInsights(spendingRes.data);
      }
      if (trendsRes.status === "success") {
        setTrends(trendsRes.data);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast("Failed to load analytics data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    if (currency === "NGN") {
      return `₦${(amount / 100).toLocaleString()}`;
    }
    return `${amount} ATH`;
  };

  const formatPeriod = (period: string) => {
    switch (period) {
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "90d": return "Last 90 days";
      case "1y": return "Last year";
      default: return "Last 30 days";
    }
  };

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                  Wallet Analytics
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                  Insights into your wallet activity and spending patterns
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadAnalytics}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="flex items-center justify-between w-full gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              </div>
              {isFiltersExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              )}
            </button>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 transition-all duration-300 ease-in-out overflow-hidden ${
              isFiltersExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Period
                </label>
                <select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={filters.currency}
                  onChange={(e) => handleFilterChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">All Currencies</option>
                  <option value="NGN">NGN</option>
                  <option value="ATH">ATH</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="user">User</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="shopping">Shopping</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Granularity
                </label>
                <select
                  value={filters.granularity}
                  onChange={(e) => handleFilterChange('granularity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {analytics && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                    <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white">{analytics.summary.totalTransactions}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
                    <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(analytics.summary.totalVolume, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Avg Transaction</p>
                    <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(analytics.summary.avgTransactionAmount, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Target className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Daily Average</p>
                    <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(analytics.summary.avgDailyVolume, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Spending Patterns */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  Spending Patterns
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Most Active Day</span>
                    <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{analytics.spendingPatterns.mostActiveDay}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Most Active Hour</span>
                    <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{analytics.spendingPatterns.mostActiveHour}:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Largest Transaction</span>
                    <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {formatCurrency(analytics.spendingPatterns.largestTransaction, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Smallest Transaction</span>
                    <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {formatCurrency(analytics.spendingPatterns.smallestTransaction, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  Transaction Breakdown
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Deposits</span>
                    <span className="font-semibold text-sm sm:text-base text-green-600 dark:text-green-400">
                      {formatCurrency(analytics.summary.totalDeposits, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Withdrawals</span>
                    <span className="font-semibold text-sm sm:text-base text-red-600 dark:text-red-400">
                      {formatCurrency(analytics.summary.totalWithdrawals, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Transfers</span>
                    <span className="font-semibold text-sm sm:text-base text-blue-600 dark:text-blue-400">
                      {formatCurrency(analytics.summary.totalTransfers, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          )}

          {analytics && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Vendor Earnings</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Vendor Payments</span>
                  <span className="font-semibold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(analytics.summary.totalDeposits, filters.currency === 'all' ? 'NGN' : filters.currency)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Payments received from delivered orders
                </div>
              </div>
            </div>
          )}

          {/* Category Spending */}
          {spendingInsights && spendingInsights.categorySpending.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                Spending by Category
              </h3>
              <div className="space-y-3">
                {spendingInsights.categorySpending.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 capitalize">{item.category}</span>
                    <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {formatCurrency(item.amount, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day of Week Spending */}
          {spendingInsights && spendingInsights.dayOfWeekSpending.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                Spending by Day of Week
              </h3>
              <div className="space-y-3">
                {spendingInsights.dayOfWeekSpending.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{item.day}</span>
                    <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {formatCurrency(item.amount, filters.currency === 'all' ? 'NGN' : filters.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Data State */}
          {analytics && analytics.summary.totalTransactions === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                No transactions found for the selected period and filters.
              </p>
              <button
                onClick={() => setFilters(prev => ({ ...prev, period: "30d", currency: "all", type: "all" }))}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
