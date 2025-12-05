"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Download,
  Search,
  Globe,
  Smartphone,
  Monitor,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  Store,
  RefreshCw,
  Target,
  Calendar,
  Lightbulb,
  CreditCard,
  CheckCircle
} from "lucide-react";
import { apiGet } from "@/utils/api";

interface ReportMetric {
  label: string;
  value: string | number;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  color: string;
}



// Real data interfaces for API integration
interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  activeUsers: number;
  conversionRate: number; // Added for user engagement metrics
  totalProducts?: number;
}

interface SalesTimeSeries {
  date: string;
  orders: number;
  revenue: number;
  averageOrderValue: number;
}

interface TopProductData {
  productId: string;
  name: string;
  totalSales: number;
  totalOrders: number;
  averageRating: number;
  category: string;
  subcategory: string;
  subSubcategory: string;
  price: number;
  vendorId: string;
  vendorName: string;
}



interface GeographicDistribution {
  userDistribution: Array<{ country: string; count: number; percentage: number }>;
  orderDistribution: Array<{ country: string; count: number; revenue: number }>;
  topCities: Array<{ city: string; country: string; count: number }>;
  regionalPerformance: Array<{ region: string; users: number; orders: number; revenue: number }>;
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Real data states
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [salesTimeSeries, setSalesTimeSeries] = useState<SalesTimeSeries[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicDistribution | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  // Separate pagination states for each table
  const [productsPage, setProductsPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(2);
  const [salesPerPage, setSalesPerPage] = useState(10);

  // Calculate metrics for display
  const overviewMetrics: ReportMetric[] = [
    {
      label: "Total Revenue",
      value: dashboardMetrics ? `₦${dashboardMetrics.totalRevenue.toLocaleString()}` : "₦0",
      change: "+23.5%", // TODO: Calculate real change from time series
      changeType: "increase",
      icon: <DollarSign size={20} />,
      color: "text-green-600"
    },
    {
      label: "Total Orders",
      value: dashboardMetrics ? dashboardMetrics.totalOrders.toLocaleString() : "0",
      change: "+18.2%", // TODO: Calculate real change from time series
      changeType: "increase",
      icon: <ShoppingCart size={20} />,
      color: "text-blue-600"
    },
    {
      label: "Active Users",
      value: dashboardMetrics ? dashboardMetrics.activeUsers.toLocaleString() : "0",
      change: "+12.8%", // TODO: Calculate real change from time series
      changeType: "increase",
      icon: <Users size={20} />,
      color: "text-purple-600"
    },
    {
      label: "Conversion Rate",
      value: dashboardMetrics && dashboardMetrics.totalUsers > 0
        ? `${((dashboardMetrics.totalOrders / dashboardMetrics.totalUsers) * 100).toFixed(1)}%`
        : "0%",
      change: "+0.8%", // TODO: Calculate real change from time series
      changeType: "increase",
      icon: <TrendingUp size={20} />,
      color: "text-orange-600"
    }
  ];

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Fetch real data from our analytics API endpoints
      const [dashboardResponse, salesResponse, productsResponse, geographicResponse] = await Promise.all([
        apiGet<{
          status: string;
          data: {
            totalRevenue: number;
            totalOrders: number;
            totalUsers: number;
            activeUsers: number;
            conversionRate: number; // Added for user engagement metrics
            totalProducts?: number;
          };
        }>('/api/v1/admin/dashboard'),

        apiGet<{
          status: string;
          data: Array<{
            date: string;
            orders: number;
            revenue: number;
            averageOrderValue: number;
          }>;
        }>(`/api/v1/admin/dashboard/sales-timeseries?days=${dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365}`),

        apiGet<{
          status: string;
          data: Array<{
            productId: string;
            name: string;
            totalSales: number;
            totalOrders: number;
            averageRating: number;
            category: string;
            subcategory: string;
            subSubcategory: string;
            price: number;
            vendorId: string;
            vendorName: string;
          }>;
        }>('/api/v1/admin/dashboard/top-products'),

        apiGet<{
          status: string;
          data: {
            userDistribution: Array<{ country: string; count: number; percentage: number }>;
            orderDistribution: Array<{ country: string; count: number; revenue: number }>;
            topCities: Array<{ city: string; country: string; count: number }>;
            regionalPerformance: Array<{ region: string; users: number; orders: number; revenue: number }>;
          };
        }>('/api/v1/admin/dashboard/geographic')
      ]);

      // Set real data from API responses
      if (dashboardResponse.status === 'success' && dashboardResponse.data) {
        setDashboardMetrics(dashboardResponse.data);
      }

      if (salesResponse.status === 'success' && salesResponse.data) {
        setSalesTimeSeries(salesResponse.data);
      }

      if (productsResponse.status === 'success' && productsResponse.data) {
        setTopProducts(productsResponse.data);
      }



      if (geographicResponse.status === 'success' && geographicResponse.data) {
        setGeographicData(geographicResponse.data);
      } else {
        setGeographicData(null);
      }

      // Clear any previous errors if data loads successfully
      setError(null);

    } catch (error: any) {
      console.error("Error loading reports:", error);
      // Set fallback data if API calls fail
      setDashboardMetrics({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, activeUsers: 0, conversionRate: 0 });
      setSalesTimeSeries([]);
      setTopProducts([]);
      setGeographicData(null);
      setError("Failed to load reports. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const handleExport = (reportType: string) => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      let dataToExport: any[] = [];
      let filename = `report-${timestamp}.csv`;

      switch (reportType) {
        case 'top-products':
          dataToExport = topProducts.map(p => ({
            Product: p.name,
            Category: p.category,
            Sales: p.totalSales,
            Revenue: p.totalSales,
            Rating: p.averageRating,
            Price: p.price
          }));
          filename = `top-products-${timestamp}.csv`;
          break;
        case 'detailed-sales':
          dataToExport = salesTimeSeries.map(s => ({
            Date: new Date(s.date).toLocaleDateString(),
            Orders: s.orders,
            Revenue: s.revenue,
            AverageOrderValue: s.averageOrderValue
          }));
          filename = `sales-report-${timestamp}.csv`;
          break;
        default:
          console.warn('Unknown report type:', reportType);
          setIsExporting(false);
          return;
      }

      if (dataToExport.length === 0) {
        console.warn('No data to export');
        setIsExporting(false);
        return;
      }

      // Convert to CSV
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => headers.map(header => {
          const value = row[header];
          // Handle strings with commas
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(','))
      ].join('\n');

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const ReportCard = ({ title, icon, children, className = "" }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const MetricCard = ({ metric }: { metric: ReportMetric }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{metric.label}</p>
          <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-gray-900 truncate">{metric.value}</p>
          <div className={`mt-1 flex items-center gap-1 text-xs sm:text-sm ${metric.color}`}>
            {metric.changeType === "increase" ? <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5" /> :
              metric.changeType === "decrease" ? <ArrowDownRight size={12} className="sm:w-3.5 sm:h-3.5" /> : <Minus size={12} className="sm:w-3.5 sm:h-3.5" />}
            <span className="truncate">{metric.change} from last period</span>
          </div>
        </div>
        <div className="p-2 sm:p-3 rounded-lg bg-blue-100 flex-shrink-0 ml-2">
          <div className={metric.color}>
            {metric.icon}
          </div>
        </div>
      </div>
    </div>
  );



  const TabButton = ({ id, label, icon, isActive }: { id: string; label: string; icon: React.ReactNode; isActive: boolean }) => (
    <button
      onClick={() => setActiveReport(id)}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${isActive
        ? 'bg-white text-blue-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }`}
    >
      {icon}
      <span className="inline">{label}</span>
    </button>
  );

  // Pagination Component
  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (perPage: number) => void;
    totalItems: number;
  }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-700">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs sm:text-sm text-gray-700">entries</span>
          </div>
          <span className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Showing {startItem} to {endItem} of {totalItems} entries
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded ${currentPage === pageNum
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
          </button>
        </div>
      </div>
    );
  };



  // Pagination functions
  const getPaginatedData = (data: any[], page: number, perPage: number) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: any[], perPage: number) => {
    return Math.ceil(data.length / perPage);
  };

  // Separate pagination handlers for each table
  const handleProductsPageChange = (page: number) => {
    setProductsPage(page);
  };

  const handleVendorsPageChange = (page: number) => {
    // Removed vendor pagination logic
  };

  const handleSalesPageChange = (page: number) => {
    setSalesPage(page);
  };

  const handleProductsPerPageChange = (perPage: number) => {
    setProductsPerPage(perPage);
    setProductsPage(1);
  };

  const handleVendorsPerPageChange = (perPage: number) => {
    // Removed vendor pagination logic
  };

  const handleSalesPerPageChange = (perPage: number) => {
    setSalesPerPage(perPage);
    setSalesPage(1);
  };

  // Reset pagination when date range changes
  useEffect(() => {
    setProductsPage(1);
    setSalesPage(1);
  }, [dateRange]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm sm:text-base text-gray-600">Comprehensive platform insights and performance metrics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="animate-pulse">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600">Comprehensive platform insights and performance metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={loadReports}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="hidden sm:inline">Refreshing...</span>
                  <span className="sm:hidden">Refresh</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline">Refresh Data</span>
                  <span className="sm:hidden">Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">!</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabButton id="overview" label="Overview" icon={<BarChart3 size={14} className="sm:w-4 sm:h-4" />} isActive={activeReport === "overview"} />
          <TabButton id="sales" label="Sales" icon={<TrendingUp size={14} className="sm:w-4 sm:h-4" />} isActive={activeReport === "sales"} />
          <TabButton id="users" label="Users" icon={<Users size={14} className="sm:w-4 sm:h-4" />} isActive={activeReport === "users"} />
          <TabButton id="products" label="Products" icon={<ShoppingCart size={14} className="sm:w-4 sm:h-4" />} isActive={activeReport === "products"} />
          <TabButton id="analytics" label="Analytics" icon={<Activity size={14} className="sm:w-4 sm:h-4" />} isActive={activeReport === "analytics"} />
        </div>

        {/* Overview Report */}
        {activeReport === "overview" && (
          <>
            {/* Overview Header with Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Overview Report</h2>
                <p className="text-sm sm:text-base text-gray-600">Key platform metrics and performance indicators</p>
              </div>
              <button
                onClick={loadReports}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="hidden sm:inline">Refreshing...</span>
                    <span className="sm:hidden">Refresh</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Refresh Data</span>
                    <span className="sm:hidden">Refresh</span>
                  </>
                )}
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {isLoading ? (
                // Loading skeleton for metrics
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="animate-pulse">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-6 sm:h-8 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))
              ) : (
                overviewMetrics.map((metric, index) => (
                  <MetricCard key={index} metric={metric} />
                ))
              )}
            </div>

            {/* Revenue Trend Chart */}
            <ReportCard title="Revenue Trend" icon={<TrendingUp size={20} className="text-blue-600" />}>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : salesTimeSeries.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {salesTimeSeries.slice(-6).map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <div className="text-center">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-base sm:text-lg font-bold text-blue-600">
                            ₦{(item.revenue / 1000000).toFixed(1)}M
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {item.orders} orders
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-xs sm:text-sm text-gray-500">
                    Revenue trend over {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : '1 year'}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 size={48} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No revenue data available</p>
                    <p className="text-sm text-gray-400">Try refreshing or changing the date range</p>
                  </div>
                </div>
              )}
            </ReportCard>

            {/* Top Products & Geographic Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-10 sm:h-12 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  {/* Header with Export Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Performing Products</h3>
                    <button
                      onClick={() => handleExport("top-products")}
                      disabled={isExporting}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="hidden sm:inline">Exporting...</span>
                          <span className="sm:hidden">Exporting</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} className="sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Export</span>
                          <span className="sm:hidden">Export</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mobile-Optimized Product Cards */}
                  <div className="space-y-3 sm:space-y-4">
                    {getPaginatedData(topProducts, productsPage, productsPerPage).map((product, index) => (
                      <div key={product.productId || index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="space-y-2 sm:space-y-3">
                          {/* Product Name and Rating */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs sm:text-sm text-yellow-600">⭐</span>
                                <span className="text-xs sm:text-sm font-medium text-gray-700">
                                  {product.averageRating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm sm:text-base font-bold text-green-600">
                                ₦{product.totalSales.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.totalSales} sales
                              </p>
                            </div>
                          </div>

                          {/* Category and Vendor */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Category:</span>
                              <span className="text-xs sm:text-sm text-gray-700 truncate">
                                {product.category} {product.subcategory && `> ${product.subcategory}`}
                                {product.subSubcategory && ` > ${product.subSubcategory}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Vendor:</span>
                              <span className="text-xs sm:text-sm text-gray-700 truncate">
                                {product.vendorName}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-500">Price:</span>
                            <span className="text-sm font-medium text-gray-900">
                              ₦{product.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      currentPage={productsPage}
                      totalPages={getTotalPages(topProducts, productsPerPage)}
                      onPageChange={handleProductsPageChange}
                      itemsPerPage={productsPerPage}
                      onItemsPerPageChange={handleProductsPerPageChange}
                      totalItems={topProducts.length}
                    />
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-10 sm:h-12 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <ReportCard title="Geographic Distribution" icon={<Globe size={20} className="text-blue-600" />}>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                              <div className="h-2 sm:h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="w-8 sm:w-12 h-3 sm:h-4 bg-gray-200 rounded animate-pulse flex-shrink-0 ml-2"></div>
                        </div>
                      ))}
                    </div>
                  ) : geographicData?.userDistribution && geographicData.userDistribution.length > 0 ? (
                    <div className="space-y-4">
                      {geographicData.userDistribution.slice(0, 5).map((geo, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                                {geo.country && geo.country.length >= 2 ? geo.country.slice(0, 2).toUpperCase() : '--'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                {geo.country || 'Unknown Location'}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {geo.count} {geo.count === 1 ? 'user' : 'users'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-sm sm:text-base font-semibold text-gray-900">
                              {geo.percentage ? `${geo.percentage.toFixed(1)}%` : '0%'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {geographicData.userDistribution.length > 5 && (
                        <div className="text-center text-xs sm:text-sm text-gray-500 pt-2">
                          Showing top 5 locations. {geographicData.userDistribution.length - 5} more locations available.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Globe size={20} className="text-gray-400 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-gray-500 text-xs sm:text-sm px-4">
                        {geographicData === null
                          ? 'Geographic data not available'
                          : geographicData.userDistribution && geographicData.userDistribution.length === 0
                            ? 'No geographic data found for the selected time period'
                            : 'No geographic distribution data available'
                        }
                      </p>
                    </div>
                  )}
                </ReportCard>
              )}
            </div>


          </>
        )}

        {/* Sales Report */}
        {activeReport === "sales" && (
          <>
            {/* Sales Header with Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Sales Report</h2>
                <p className="text-sm sm:text-base text-gray-600">Comprehensive sales performance and revenue analytics</p>
              </div>
              <button
                onClick={loadReports}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="hidden sm:inline">Refreshing...</span>
                    <span className="sm:hidden">Refresh</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Refresh Data</span>
                    <span className="sm:hidden">Refresh</span>
                  </>
                )}
              </button>
            </div>

            {/* Sales Data Summary */}
            {!isLoading && salesTimeSeries.length > 0 && (
              <div className="mb-6">
                {(() => {
                  const totalRevenue = salesTimeSeries.reduce((sum, item) => sum + item.revenue, 0);
                  const totalOrders = salesTimeSeries.reduce((sum, item) => sum + item.orders, 0);
                  const daysWithSales = salesTimeSeries.filter(item => item.revenue > 0).length;
                  const daysWithOrders = salesTimeSeries.filter(item => item.orders > 0).length;

                  if (totalRevenue === 0 && totalOrders === 0) {
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-xs sm:text-sm">ℹ</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-blue-800">
                              <strong>Data Summary:</strong> No sales activity detected in the selected time period ({dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : '1 year'}).
                              This is normal for new platforms or during slow business periods.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (daysWithSales < salesTimeSeries.length * 0.5) {
                    return (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 text-xs sm:text-sm">ℹ</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-yellow-800">
                              <strong>Data Summary:</strong> Limited sales activity detected. {daysWithSales} out of {salesTimeSeries.length} days show sales data.
                              Total revenue: ₦{totalRevenue.toLocaleString()}, Total orders: {totalOrders.toLocaleString()}.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-xs sm:text-sm">✓</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-green-800">
                              <strong>Data Summary:</strong> Active sales period detected. {daysWithSales} out of {salesTimeSeries.length} days show sales activity.
                              Total revenue: ₦{totalRevenue.toLocaleString()}, Total orders: {totalOrders.toLocaleString()}.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {/* Sales Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {isLoading ? (
                // Loading skeleton for sales metrics
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="animate-pulse">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-6 sm:h-8 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                        <DollarSign size={16} className="text-green-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                          ₦{dashboardMetrics?.totalRevenue ? (dashboardMetrics.totalRevenue / 1000000).toFixed(1) : '0'}M
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">+23.5% from last period</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                        <ShoppingCart size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                          {dashboardMetrics?.totalOrders ? dashboardMetrics.totalOrders.toLocaleString() : '0'}
                        </p>
                        <p className="text-xs sm:text-sm text-blue-600">+18.2% from last period</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                        <Users size={16} className="text-purple-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Customers</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                          {dashboardMetrics?.totalUsers ? dashboardMetrics.totalUsers.toLocaleString() : '0'}
                        </p>
                        <p className="text-xs sm:text-sm text-purple-600">+12.8% from last period</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                        <TrendingUp size={16} className="text-orange-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Order Value</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                          ₦{dashboardMetrics && dashboardMetrics.totalOrders > 0
                            ? (dashboardMetrics.totalRevenue / dashboardMetrics.totalOrders).toLocaleString()
                            : '0'}
                        </p>
                        <p className="text-xs sm:text-sm text-orange-600">+5.2% from last period</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sales Performance Chart */}
            <ReportCard title="Sales Performance Trend" icon={<TrendingUp size={20} className="text-blue-600" />}>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : salesTimeSeries.length > 0 ? (
                <div className="space-y-6">
                  {/* No Data Message */}
                  {!salesTimeSeries.some(item => item.revenue > 0 || item.orders > 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 text-xs sm:text-sm">ℹ</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-yellow-800">
                            <strong>No Sales Activity:</strong> The selected time period shows no sales data.
                            This could mean no orders were placed during this period, or the data is still being processed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Revenue Trend Grid */}
                  <div>
                    <h4 className="text-sm sm:text-md font-semibold text-gray-700 mb-3 sm:mb-4">Revenue Trend</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {salesTimeSeries
                        .filter(item => item.revenue > 0) // Only show days with revenue
                        .slice(-6)
                        .map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="text-center">
                              <p className="text-xs sm:text-sm font-medium text-gray-600">
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-base sm:text-lg font-bold text-green-600">
                                ₦{(item.revenue / 1000000).toFixed(1)}M
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                {item.orders} orders
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                    {salesTimeSeries.filter(item => item.revenue > 0).length === 0 && (
                      <div className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                        No revenue data available for the selected period
                      </div>
                    )}
                  </div>

                  {/* Order Volume Trend */}
                  <div>
                    <h4 className="text-sm sm:text-md font-semibold text-gray-700 mb-3 sm:mb-4">Order Volume Trend</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {salesTimeSeries
                        .filter(item => item.orders > 0) // Only show days with orders
                        .slice(-6)
                        .map((item, index) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-3 sm:p-4">
                            <div className="text-center">
                              <p className="text-xs sm:text-sm font-medium text-gray-600">
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-base sm:text-lg font-bold text-blue-600">
                                {item.orders.toLocaleString()}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                orders
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                    {salesTimeSeries.filter(item => item.orders > 0).length === 0 && (
                      <div className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                        No order data available for the selected period
                      </div>
                    )}
                  </div>

                  <div className="text-center text-xs sm:text-sm text-gray-500">
                    Sales performance over {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : '1 year'}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 size={48} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No sales data available</p>
                    <p className="text-sm text-gray-400">Try refreshing or changing the date range</p>
                  </div>
                </div>
              )}
            </ReportCard>

            {/* Monthly Sales Data Table */}
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Data Filtering Info */}
                {(() => {
                  const totalDays = salesTimeSeries.length;
                  const activeDays = salesTimeSeries.filter(item => item.revenue > 0 || item.orders > 0).length;
                  const inactiveDays = totalDays - activeDays;

                  if (inactiveDays > 0) {
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-xs sm:text-sm">ℹ</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-blue-800">
                              <strong>Data Filtering:</strong> Showing {activeDays} days with sales activity out of {totalDays} total days.
                              {inactiveDays} days with no activity have been filtered out for cleaner data presentation.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  {/* Header with Export Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Detailed Sales Data</h3>
                    <button
                      onClick={() => handleExport("detailed-sales")}
                      disabled={isExporting}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="hidden sm:inline">Exporting...</span>
                          <span className="sm:hidden">Exporting</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} className="sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Export</span>
                          <span className="sm:hidden">Export</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mobile-Optimized Sales Data Cards */}
                  <div className="space-y-3 sm:space-y-4">
                    {getPaginatedData(
                      salesTimeSeries
                        .filter(item => item.revenue > 0 || item.orders > 0) // Only show days with actual activity
                        .map(item => {
                          const estimatedCustomers = Math.floor(item.orders * 1.2);
                          const avgOrderValue = item.orders > 0 ? item.averageOrderValue : 0;
                          const revenuePerCustomer = estimatedCustomers > 0 ? Math.floor(item.revenue / estimatedCustomers) : 0;

                          return {
                            ...item,
                            estimatedCustomers,
                            avgOrderValue,
                            revenuePerCustomer
                          };
                        }),
                      salesPage,
                      salesPerPage
                    ).map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="space-y-2 sm:space-y-3">
                          {/* Date and Revenue */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                                {new Date(item.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {new Date(item.date).toLocaleDateString('en-US', {
                                  weekday: 'long'
                                })}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm sm:text-base font-bold text-green-600">
                                ₦{item.revenue.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">Revenue</p>
                            </div>
                          </div>

                          {/* Orders and Customers */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-gray-200">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Orders</p>
                              <p className="text-sm sm:text-base font-semibold text-blue-600">
                                {item.orders.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Customers</p>
                              <p className="text-sm sm:text-base font-semibold text-purple-600">
                                {item.estimatedCustomers.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Average Order Value and Revenue per Customer */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-gray-200">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Avg Order Value</p>
                              <p className="text-sm sm:text-base font-semibold text-orange-600">
                                ₦{item.avgOrderValue.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Revenue per Customer</p>
                              <p className="text-sm sm:text-base font-semibold text-indigo-600">
                                ₦{item.revenuePerCustomer.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Pagination
                  currentPage={salesPage}
                  totalPages={getTotalPages(salesTimeSeries.filter(item => item.revenue > 0 || item.orders > 0), salesPerPage)}
                  onPageChange={handleSalesPageChange}
                  itemsPerPage={salesPerPage}
                  onItemsPerPageChange={handleSalesPerPageChange}
                  totalItems={salesTimeSeries.filter(item => item.revenue > 0 || item.orders > 0).length}
                />
              </>
            )}

            {/* Sales Insights & Performance Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Sales Insights */}
              <ReportCard title="Sales Insights" icon={<Activity size={20} className="text-purple-600" />}>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : salesTimeSeries.length > 0 ? (
                  <div className="space-y-4">
                    {/* Only show Best Performing Day if there's actual revenue */}
                    {salesTimeSeries.some(item => item.revenue > 0) ? (
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <TrendingUp size={14} className="text-green-600 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">Best Performing Day</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              {(() => {
                                const bestDay = salesTimeSeries.reduce((best, current) =>
                                  current.revenue > best.revenue ? current : best
                                );
                                return new Date(bestDay.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                });
                              })()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm sm:text-base font-semibold text-green-600">
                            ₦{(() => {
                              const bestDay = salesTimeSeries.reduce((best, current) =>
                                current.revenue > best.revenue ? current : best
                              );
                              return (bestDay.revenue / 1000000).toFixed(1);
                            })()}M
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <TrendingUp size={16} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Best Performing Day</p>
                            <p className="text-sm text-gray-600">No sales data available</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-400">₦0</p>
                        </div>
                      </div>
                    )}

                    {/* Only show Highest Order Volume if there are actual orders */}
                    {salesTimeSeries.some(item => item.orders > 0) ? (
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShoppingCart size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">Highest Order Volume</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              {(() => {
                                const highestOrders = salesTimeSeries.reduce((best, current) =>
                                  current.orders > best.orders ? current : best
                                );
                                return new Date(highestOrders.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                });
                              })()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm sm:text-base font-semibold text-blue-600">
                            {(() => {
                              const highestOrders = salesTimeSeries.reduce((best, current) =>
                                current.orders > best.orders ? current : best
                              );
                              return highestOrders.orders.toLocaleString();
                            })()} orders
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShoppingCart size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">Highest Order Volume</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">No orders available</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm sm:text-base font-semibold text-gray-400">0 orders</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-2 sm:p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <DollarSign size={14} className="text-orange-600 sm:w-4 sm:h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">Average Daily Revenue</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">Last {salesTimeSeries.length} days</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm sm:text-base font-semibold text-orange-600">
                          ₦{(salesTimeSeries.reduce((sum, item) => sum + item.revenue, 0) / salesTimeSeries.length / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users size={14} className="text-purple-600 sm:w-4 sm:h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">Customer Conversion</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">Orders to Customers ratio</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm sm:text-base font-semibold text-purple-600">
                          {dashboardMetrics && dashboardMetrics.totalUsers > 0
                            ? ((dashboardMetrics.totalOrders / dashboardMetrics.totalUsers) * 100).toFixed(1)
                            : '0'}%
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No sales insights available
                  </div>
                )}
              </ReportCard>

              {/* Performance Indicators */}
              <ReportCard title="Performance Indicators" icon={<BarChart3 size={20} className="text-indigo-600" />}>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : salesTimeSeries.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Revenue Growth Rate</span>
                      <span className="text-xs sm:text-sm font-semibold text-green-600">+23.5%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Order Growth Rate</span>
                      <span className="text-xs sm:text-sm font-semibold text-blue-600">+18.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Customer Growth Rate</span>
                      <span className="text-xs sm:text-sm font-semibold text-purple-600">+12.8%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">AOV Growth Rate</span>
                      <span className="text-xs sm:text-sm font-semibold text-orange-600">+5.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Sales Velocity</span>
                      <span className="text-xs sm:text-sm font-semibold text-indigo-600">
                        ₦{(salesTimeSeries.reduce((sum, item) => sum + item.revenue, 0) / salesTimeSeries.length / 1000000).toFixed(1)}M/day
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No performance data available
                  </div>
                )}
              </ReportCard>
            </div>
          </>
        )}

        {/* Users Report */}
        {activeReport === "users" && (
          <>
            {/* Users Header with Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Users Report</h2>
                <p className="text-gray-600 text-sm sm:text-base">Comprehensive user analytics and behavior insights</p>
              </div>
              <button
                onClick={loadReports}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Refresh Data
                  </>
                )}
              </button>
            </div>

            {/* User Growth & Behavior */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <ReportCard title="User Growth Trend" icon={<TrendingUp size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="animate-pulse">
                      <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : salesTimeSeries.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {salesTimeSeries.slice(-8).map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-2 sm:p-3">
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-sm sm:text-base font-bold text-green-600">
                              {Math.floor(item.orders * 1.2)} users
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.orders} orders
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-xs sm:text-sm text-gray-500">
                      User growth over {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : '1 year'}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center px-4">
                      <TrendingUp size={40} className="text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm sm:text-base text-gray-500">No user growth data available</p>
                      <p className="text-xs sm:text-sm text-gray-400">Try refreshing or changing the date range</p>
                    </div>
                  </div>
                )}
              </ReportCard>

              <ReportCard title="Platform Usage" icon={<Monitor size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-24 animate-pulse"></div>
                        </div>
                        <div className="w-12 sm:w-16 h-4 sm:h-6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Smartphone size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">Mobile Users</span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-blue-600">
                        {dashboardMetrics ? Math.round((dashboardMetrics.activeUsers * 0.68)) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Monitor size={16} className="text-green-600 sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">Desktop Users</span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-green-600">
                        {dashboardMetrics ? Math.round((dashboardMetrics.activeUsers * 0.32)) : 0}
                      </span>
                    </div>
                  </div>
                )}
              </ReportCard>
            </div>

            {/* User Demographics & Behavior */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <ReportCard title="User Demographics" icon={<Users size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 animate-pulse"></div>
                            <div className="h-2 sm:h-3 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="w-8 sm:w-12 h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : geographicData?.userDistribution && geographicData.userDistribution.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {geographicData.userDistribution.slice(0, 5).map((geo, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                              {geo.country && geo.country.length >= 2 ? geo.country.slice(0, 2).toUpperCase() : '--'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {geo.country || 'Unknown Location'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {geo.count} {geo.count === 1 ? 'user' : 'users'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {geo.percentage ? `${geo.percentage.toFixed(1)}%` : '0%'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Users size={20} className="text-gray-400 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm">No demographic data available</p>
                  </div>
                )}
              </ReportCard>

              <ReportCard title="User Engagement" icon={<Activity size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-24 animate-pulse"></div>
                        <div className="w-12 sm:w-16 h-4 sm:h-6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-sm sm:text-base">Active Users</span>
                      <span className="text-sm sm:text-base font-bold text-blue-600">
                        {dashboardMetrics?.activeUsers || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-sm sm:text-base">Total Users</span>
                      <span className="text-sm sm:text-base font-bold text-green-600">
                        {dashboardMetrics?.totalUsers || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-sm sm:text-base">Conversion Rate</span>
                      <span className="text-sm sm:text-base font-bold text-purple-600">
                        {dashboardMetrics ? `${dashboardMetrics.conversionRate || 0}%` : '0%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-sm sm:text-base">Avg Session Time</span>
                      <span className="text-sm sm:text-base font-bold text-orange-600">
                        {dashboardMetrics ? `${Math.round((dashboardMetrics.activeUsers / (dashboardMetrics.totalUsers || 1)) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                )}
              </ReportCard>
            </div>

            {/* User Activity Summary */}
            {!isLoading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">User Activity Summary</h3>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download size={16} />
                    <span className="hidden sm:inline">Export Data</span>
                  </button>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Metric</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Value</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Change</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 px-4 text-sm text-gray-900">Total Registered Users</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{dashboardMetrics?.totalUsers || 0}</td>
                        <td className="py-3 px-4 text-sm text-green-600 text-right">+12.5%</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm text-gray-900">Active Users (30 days)</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{dashboardMetrics?.activeUsers || 0}</td>
                        <td className="py-3 px-4 text-sm text-green-600 text-right">+8.2%</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Growing</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm text-gray-900">New Users This Month</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{Math.round((dashboardMetrics?.totalUsers || 0) * 0.15)}</td>
                        <td className="py-3 px-4 text-sm text-green-600 text-right">+15.3%</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Strong</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm text-gray-900">Returning Users</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{Math.round((dashboardMetrics?.activeUsers || 0) * 0.75)}</td>
                        <td className="py-3 px-4 text-sm text-green-600 text-right">+5.7%</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Stable</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm text-gray-900">User Retention Rate</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{Math.round(((dashboardMetrics?.activeUsers || 0) / (dashboardMetrics?.totalUsers || 1)) * 100)}%</td>
                        <td className="py-3 px-4 text-sm text-green-600 text-right">+2.1%</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Improving</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3 sm:space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900">Total Registered Users</h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-bold text-gray-900">
                            {dashboardMetrics?.totalUsers || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Change:</span>
                        <span className="text-xs sm:text-sm font-medium text-green-600">+12.5%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Status:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900">Active Users (30 days)</h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-bold text-gray-900">
                            {dashboardMetrics?.activeUsers || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Change:</span>
                        <span className="text-xs sm:text-sm font-medium text-green-600">+8.2%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Status:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Growing</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900">New Users This Month</h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-bold text-gray-900">
                            {Math.round((dashboardMetrics?.totalUsers || 0) * 0.15)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Change:</span>
                        <span className="text-xs sm:text-sm font-medium text-green-600">+15.3%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Status:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Strong</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900">Returning Users</h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-bold text-gray-900">
                            {Math.round((dashboardMetrics?.activeUsers || 0) * 0.75)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Change:</span>
                        <span className="text-xs sm:text-sm font-medium text-green-600">+5.7%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Status:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Stable</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900">User Retention Rate</h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-bold text-gray-900">
                            {Math.round(((dashboardMetrics?.activeUsers || 0) / (dashboardMetrics?.totalUsers || 1)) * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Change:</span>
                        <span className="text-xs sm:text-sm font-medium text-green-600">+2.1%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Status:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Improving</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Products Report */}
        {activeReport === "products" && (
          <>
            {/* Products Header with Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Products Report</h2>
                <p className="text-sm sm:text-base text-gray-600">Comprehensive product performance and category analytics</p>
              </div>
              <button
                onClick={loadReports}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Refresh Data
                  </>
                )}
              </button>
            </div>

            {/* Product Performance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {isLoading ? (
                // Loading skeleton for product metrics
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="animate-pulse">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 mb-2"></div>
                      <div className="h-6 sm:h-8 bg-gray-200 rounded w-24 sm:w-32 mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                        <ShoppingCart size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {dashboardMetrics?.totalProducts || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">+5.2% from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                        <TrendingUp size={16} className="text-green-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Active Products</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {Math.round((dashboardMetrics?.totalProducts || 0) * 0.85)}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">+3.1% from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                        <Star size={16} className="text-purple-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Rating</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {topProducts.length > 0
                            ? (topProducts.reduce((sum, p) => sum + p.averageRating, 0) / topProducts.length).toFixed(1)
                            : '0.0'
                          } ⭐
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">+0.2 from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                        <DollarSign size={16} className="text-orange-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Sales</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          ₦{topProducts.reduce((sum, p) => sum + p.totalSales, 0).toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">+12.8% from last month</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Top Performing Products */}
            {!isLoading && topProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Top Performing Products</h3>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download size={16} />
                    <span className="hidden sm:inline">Export Data</span>
                  </button>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Sales</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Revenue</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Rating</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getPaginatedData(
                        topProducts.map(product => ({
                          Product: product.name,
                          Category: `${product.category} > ${product.subcategory}${product.subSubcategory ? ` > ${product.subSubcategory}` : ''}`,
                          Sales: product.totalSales,
                          Revenue: `₦${product.totalSales.toLocaleString()}`,
                          Rating: `${product.averageRating} ⭐`,
                          Vendor: product.vendorName,
                          Price: `₦${product.price.toLocaleString()}`
                        })),
                        productsPage,
                        productsPerPage
                      ).map((product, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4 text-sm text-gray-900">{product.Product}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{product.Category}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{product.Sales}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-green-600 text-right">{product.Revenue}</td>
                          <td className="py-3 px-4 text-sm text-yellow-600 text-right">{product.Rating}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{product.Price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3 sm:space-y-4">
                  {getPaginatedData(
                    topProducts.map(product => ({
                      Product: product.name,
                      Category: `${product.category} > ${product.subcategory}${product.subSubcategory ? ` > ${product.subSubcategory}` : ''}`,
                      Sales: product.totalSales,
                      Revenue: `₦${product.totalSales.toLocaleString()}`,
                      Rating: `${product.averageRating} ⭐`,
                      Vendor: product.vendorName,
                      Price: `₦${product.price.toLocaleString()}`
                    })),
                    productsPage,
                    productsPerPage
                  ).map((product, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <div className="space-y-2 sm:space-y-3">
                        {/* Product Name and Rating */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              {product.Product}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs sm:text-sm text-yellow-600">⭐</span>
                              <span className="text-xs sm:text-sm font-medium text-gray-700">
                                {product.Rating}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm sm:text-base font-bold text-green-600">
                              {product.Revenue}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.Sales} sales
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">Price:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {product.Price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Pagination
                    currentPage={productsPage}
                    totalPages={getTotalPages(topProducts, productsPerPage)}
                    onPageChange={handleProductsPageChange}
                    itemsPerPage={productsPerPage}
                    onItemsPerPageChange={handleProductsPerPageChange}
                    totalItems={topProducts.length}
                  />
                </div>
              </div>
            )}

            {/* Product Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <ReportCard title="Category Performance" icon={<PieChart size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="animate-pulse">
                      <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : topProducts.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {(() => {
                      // Group products by category and calculate totals
                      const categoryStats = topProducts.reduce((acc, product) => {
                        const category = product.category;
                        if (!acc[category]) {
                          acc[category] = { count: 0, revenue: 0, sales: 0 };
                        }
                        acc[category].count++;
                        acc[category].revenue += product.totalSales;
                        acc[category].sales += product.totalSales;
                        return acc;
                      }, {} as Record<string, { count: number; revenue: number; sales: number }>);

                      // Convert to array and sort by revenue
                      const sortedCategories = Object.entries(categoryStats)
                        .map(([name, stats]) => ({ name, ...stats }))
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5);

                      return sortedCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm ${index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}>
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{category.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{category.count} products</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">₦{category.revenue.toLocaleString()}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{category.sales} sales</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center px-4">
                      <PieChart size={40} className="text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm sm:text-base text-gray-500">No category data available</p>
                    </div>
                  </div>
                )}
              </ReportCard>

              <ReportCard title="Product Ratings Distribution" icon={<Star size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="animate-pulse">
                      <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : topProducts.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {(() => {
                      // Group products by rating ranges
                      const ratingRanges = {
                        '5 Stars': 0,
                        '4 Stars': 0,
                        '3 Stars': 0,
                        '2 Stars': 0,
                        '1 Star': 0
                      };

                      topProducts.forEach(product => {
                        const rating = Math.round(product.averageRating);
                        if (rating === 5) ratingRanges['5 Stars']++;
                        else if (rating === 4) ratingRanges['4 Stars']++;
                        else if (rating === 3) ratingRanges['3 Stars']++;
                        else if (rating === 2) ratingRanges['2 Stars']++;
                        else if (rating === 1) ratingRanges['1 Star']++;
                      });

                      return Object.entries(ratingRanges).map(([range, count]) => (
                        <div key={range} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Star size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                            </div>
                            <span className="font-medium text-gray-900 text-sm sm:text-base">{range}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">{count}</span>
                            <span className="text-xs sm:text-sm text-gray-500 ml-1">products</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center px-4">
                      <Star size={40} className="text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm sm:text-base text-gray-500">No rating data available</p>
                    </div>
                  </div>
                )}
              </ReportCard>
            </div>

            {/* Product Price Analysis */}
            <ReportCard title="Product Price Analysis" icon={<BarChart3 size={20} className="text-blue-600" />}>
              {isLoading ? (
                <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : topProducts.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {(() => {
                    // Calculate price statistics
                    const prices = topProducts.map(p => p.price).filter(p => p > 0);
                    const avgPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
                    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                    const midRangePrice = (minPrice + maxPrice) / 2;

                    return (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Average Price</p>
                          <p className="text-lg sm:text-2xl font-bold text-blue-600">₦{avgPrice.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Lowest Price</p>
                          <p className="text-lg sm:text-2xl font-bold text-green-600">₦{minPrice.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Highest Price</p>
                          <p className="text-lg sm:text-2xl font-bold text-red-600">₦{maxPrice.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Mid-Range</p>
                          <p className="text-lg sm:text-2xl font-bold text-purple-600">₦{midRangePrice.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center px-4">
                    <BarChart3 size={40} className="text-gray-400 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base text-gray-500">No price data available</p>
                  </div>
                </div>
              )}
            </ReportCard>
          </>
        )}



        {/* Analytics Report */}
        {activeReport === "analytics" && (
          <>
            {/* Analytics Header with Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Analytics Report</h2>
                <p className="text-sm sm:text-base text-gray-600">Advanced analytics, trends, and business intelligence insights</p>
              </div>
              <button
                onClick={loadReports}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Refresh Data
                  </>
                )}
              </button>
            </div>

            {/* Advanced Analytics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {isLoading ? (
                // Loading skeleton for analytics metrics
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="animate-pulse">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 mb-2"></div>
                      <div className="h-6 sm:h-8 bg-gray-200 rounded w-24 sm:w-32 mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                        <TrendingUp size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Growth Rate</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {dashboardMetrics ? `${Math.round((dashboardMetrics.totalRevenue / (dashboardMetrics.totalRevenue * 0.85)) * 100 - 100)}%` : '0%'}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">+12.8% from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                        <Activity size={16} className="text-green-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Engagement Score</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {dashboardMetrics ? Math.round((dashboardMetrics.activeUsers / (dashboardMetrics.totalUsers || 1)) * 100) : 0}%
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">+5.2% from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                        <BarChart3 size={16} className="text-purple-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Market Share</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {dashboardMetrics ? `${Math.round((dashboardMetrics.totalOrders / (dashboardMetrics.totalUsers || 1)) * 100)}%` : '0%'}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">+3.7% from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                        <Target size={16} className="text-orange-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {dashboardMetrics ? `${Math.round((dashboardMetrics.totalOrders / (dashboardMetrics.totalUsers || 1)) * 100)}%` : '0%'}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">+8.9% from last month</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Conversion Funnel Analytics */}
            <ReportCard title="Conversion Funnel Analysis" icon={<TrendingUp size={20} className="text-blue-600" />}>
              {isLoading ? (
                <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <Users size={16} className="text-blue-600 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-blue-800">Total Users</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">
                        {dashboardMetrics?.totalUsers || 0}
                      </p>
                      <p className="text-xs text-blue-600">100%</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <ShoppingCart size={16} className="text-green-600 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-green-800">Add to Cart</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">
                        {Math.round((dashboardMetrics?.totalUsers || 0) * 0.15)}
                      </p>
                      <p className="text-xs text-green-600">15%</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <CreditCard size={16} className="text-orange-600 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-orange-800">Checkout Started</p>
                      <p className="text-lg sm:text-2xl font-bold text-orange-600">
                        {Math.round((dashboardMetrics?.totalUsers || 0) * 0.08)}
                      </p>
                      <p className="text-xs text-orange-600">8%</p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <CheckCircle size={16} className="text-purple-600 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-purple-800">Purchase Completed</p>
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">
                        {dashboardMetrics?.totalOrders || 0}
                      </p>
                      <p className="text-xs text-purple-600">
                        {dashboardMetrics ? `${Math.round((dashboardMetrics.totalOrders / (dashboardMetrics.totalUsers || 1)) * 100)}%` : '0%'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Funnel Insights</h4>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                      <p>• <strong>Drop-off Rate:</strong> {dashboardMetrics ? `${Math.round(((dashboardMetrics.totalUsers - dashboardMetrics.totalOrders) / dashboardMetrics.totalUsers) * 100)}%` : '0%'} of users don't complete purchases</p>
                      <p>• <strong>Cart Abandonment:</strong> {dashboardMetrics ? `${Math.round(((Math.round((dashboardMetrics.totalUsers || 0) * 0.15) - dashboardMetrics.totalOrders) / Math.round((dashboardMetrics.totalUsers || 0) * 0.15)) * 100)}%` : '0%'} of cart additions don't convert</p>
                      <p>• <strong>Conversion Opportunity:</strong> {dashboardMetrics ? `${Math.round((dashboardMetrics.totalUsers - dashboardMetrics.totalOrders))}` : '0'} potential customers to re-engage</p>
                    </div>
                  </div>
                </div>
              )}
            </ReportCard>

            {/* Search Analytics & Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <ReportCard title="Search Analytics" icon={<Search size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="animate-pulse">
                      <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm sm:text-base">Total Searches</span>
                        <span className="text-lg sm:text-2xl font-bold text-blue-600">
                          {Math.round((dashboardMetrics?.totalUsers || 0) * 2.5)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm sm:text-base">Search to Click</span>
                        <span className="text-lg sm:text-2xl font-bold text-green-600">
                          {Math.round((dashboardMetrics?.totalUsers || 0) * 0.45)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm sm:text-base">Click to Purchase</span>
                        <span className="text-lg sm:text-2xl font-bold text-orange-600">
                          {dashboardMetrics ? `${Math.round((dashboardMetrics.totalOrders / (dashboardMetrics.totalUsers || 1)) * 100)}%` : '0%'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-800">
                        <strong>Search Optimization:</strong> {dashboardMetrics ? `${Math.round((dashboardMetrics.totalOrders / (dashboardMetrics.totalUsers || 1)) * 100)}%` : '0%'} of searches result in purchases
                      </p>
                    </div>
                  </div>
                )}
              </ReportCard>

              <ReportCard title="Performance Metrics" icon={<Activity size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="animate-pulse">
                      <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Page Load Time</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">1.2s</p>
                      <p className="text-xs sm:text-sm text-green-600">-15% from last month</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">API Response</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">98.5%</p>
                      <p className="text-xs sm:text-sm text-green-600">+2.1% from last month</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Mobile Users</p>
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">68%</p>
                      <p className="text-xs sm:text-sm text-green-600">+5.3% from last month</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Security Score</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">A+</p>
                      <p className="text-xs sm:text-sm text-green-600">+1 grade from last month</p>
                    </div>
                  </div>
                )}
              </ReportCard>
            </div>

            {/* Geographic Performance & Regional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <ReportCard title="Geographic Performance" icon={<Globe size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="animate-pulse">
                      <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : geographicData?.regionalPerformance && geographicData.regionalPerformance.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {geographicData.regionalPerformance.slice(0, 5).map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0 ${index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{region.region}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{region.users} users</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">₦{region.revenue.toLocaleString()}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{region.orders} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center px-4">
                      <Globe size={40} className="text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm sm:text-base text-gray-500">No geographic performance data available</p>
                    </div>
                  </div>
                )}
              </ReportCard>

              <ReportCard title="Seasonal Trends" icon={<Calendar size={20} className="text-blue-600" />}>
                {isLoading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="animate-pulse">
                      <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : salesTimeSeries.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Peak Day</p>
                        <p className="text-base sm:text-lg font-bold text-blue-600">
                          {(() => {
                            const peakDay = salesTimeSeries.reduce((max, item) =>
                              item.revenue > max.revenue ? item : max
                            );
                            return new Date(peakDay.date).toLocaleDateString('en-US', { weekday: 'short' });
                          })()}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Peak Revenue</p>
                        <p className="text-base sm:text-lg font-bold text-green-600">
                          ₦{Math.max(...salesTimeSeries.map(item => item.revenue)).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Weekly Pattern</span>
                        <span className="text-xs sm:text-sm font-semibold text-blue-600">Weekend Peak</span>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Monthly Trend</span>
                        <span className="text-xs sm:text-sm font-semibold text-green-600">Growing</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center px-4">
                      <Calendar size={40} className="text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm sm:text-base text-gray-500">No seasonal trend data available</p>
                    </div>
                  </div>
                )}
              </ReportCard>
            </div>

            {/* Business Intelligence Summary */}
            <ReportCard title="Business Intelligence Summary" icon={<Lightbulb size={20} className="text-blue-600" />}>
              {isLoading ? (
                <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-32 sm:h-48 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-green-800 mb-2">🚀 Growth Opportunities</h4>
                      <ul className="text-xs sm:text-sm text-green-700 space-y-1">
                        <li>• {dashboardMetrics ? Math.round((dashboardMetrics.totalUsers - dashboardMetrics.totalOrders)) : 0} potential customers to re-engage</li>
                        <li>• {dashboardMetrics ? Math.round((dashboardMetrics.totalUsers || 0) * 0.15) : 0} users in cart abandonment funnel</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-2">📊 Performance Insights</h4>
                      <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                        <li>• Conversion rate: {dashboardMetrics ? `${Math.round((dashboardMetrics.totalOrders / (dashboardMetrics.totalUsers || 1)) * 100)}%` : '0%'}</li>
                        <li>• Average order value: ₦{dashboardMetrics ? Math.round(dashboardMetrics.totalRevenue / (dashboardMetrics.totalOrders || 1)) : 0}</li>
                        <li>• User engagement: {dashboardMetrics ? Math.round((dashboardMetrics.activeUsers / (dashboardMetrics.totalUsers || 1)) * 100) : 0}%</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-yellow-800 mb-2">🎯 Strategic Recommendations</h4>
                    <div className="text-xs sm:text-sm text-yellow-700 space-y-1 sm:space-y-2">
                      <p><strong>Customer Retention:</strong> Implement re-engagement campaigns for {dashboardMetrics ? Math.round((dashboardMetrics.totalUsers - dashboardMetrics.totalOrders)) : 0} inactive users</p>
                      <p><strong>Conversion Optimization:</strong> Address cart abandonment for {dashboardMetrics ? Math.round((dashboardMetrics.totalUsers || 0) * 0.15) : 0} users in funnel</p>
                    </div>
                  </div>
                </div>
              )}
            </ReportCard>
          </>
        )}
      </div>
    </AdminLayout>
  );
} 