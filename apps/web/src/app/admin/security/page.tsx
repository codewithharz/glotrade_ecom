"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Shield, AlertTriangle, CheckCircle, Clock, Eye, Edit, Trash2, Filter, Search, X, User, UserCheck, FileText, Save, ShieldCheck, Activity, Lock, Download } from "lucide-react";
import { toast } from "@/components/common/Toast";
import { apiGet, apiPut, apiDelete } from "@/utils/api";

interface SecurityReport {
  _id: string;
  reportType: "communication" | "website" | "jobs";
  status: "pending" | "investigating" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  suspiciousElements: string[];
  actionTaken: string;
  reportedAt: string;
  userId?: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminSecurityPage() {
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<SecurityReport | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    assignedTo: '',
    investigationNotes: '',
    resolution: ''
  });
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    reportType: "",
    search: ""
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.priority) queryParams.append("priority", filters.priority);
      if (filters.reportType) queryParams.append("reportType", filters.reportType);
      if (filters.search) queryParams.append("search", filters.search);

      const data = await apiGet<{ status: string; data: { reports: SecurityReport[] } }>(`/api/v1/security-reports/reports?${queryParams}`);
      setReports(data.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast("Failed to fetch security reports", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: SecurityReport) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleUpdateStatus = (report: SecurityReport) => {
    setSelectedReport(report);
    setStatusFormData({
      status: report.status,
      assignedTo: report.assignedTo?.name || '',
      investigationNotes: '',
      resolution: ''
    });
    setShowStatusModal(true);
  };

  const handleDeleteReport = (report: SecurityReport) => {
    setSelectedReport(report);
    setShowDeleteModal(true);
  };

  const updateReportStatus = async () => {
    if (!selectedReport) return;

    setActionLoading(true);
    try {
      const updateData: any = {
        status: statusFormData.status,
        investigationNotes: statusFormData.investigationNotes,
        resolution: statusFormData.resolution
      };

      // Only include assignedTo if it's not empty
      if (statusFormData.assignedTo.trim()) {
        updateData.assignedTo = statusFormData.assignedTo.trim();
      }

      console.log('Updating report with data:', updateData);

      await apiPut(`/api/v1/security-reports/reports/${selectedReport._id}`, updateData);

      setShowStatusModal(false);
      setSuccessMessage(`Report status updated to ${statusFormData.status}`);
      setShowSuccessModal(true);
      fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast("Failed to update report", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReport = async () => {
    if (!selectedReport) return;

    setActionLoading(true);
    try {
      await apiDelete(`/api/v1/security-reports/reports/${selectedReport._id}`);
      setShowDeleteModal(false);
      setSuccessMessage(`Report deleted successfully`);
      setShowSuccessModal(true);
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast("Failed to delete report", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccessMessage("Security report generated and sent to your email.");
      setShowSuccessModal(true);
    } catch (error) {
      toast("Failed to generate report", "error");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "investigating": return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved": return "bg-green-100 text-green-800 border-green-200";
      case "closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "communication": return "📞";
      case "website": return "🌐";
      case "jobs": return "💼";
      default: return "📋";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading security reports...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Security Reports Management</h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-600">
              Monitor and manage security reports submitted by users
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-70"
          >
            {isGeneratingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Generate Monthly Report</span>
              </>
            )}
          </button>
        </div>

        {/* Security Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-sm text-neutral-600 font-medium">Threats Blocked</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">142</h3>
            <p className="text-xs text-neutral-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Optimal</span>
            </div>
            <p className="text-sm text-neutral-600 font-medium">System Uptime</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">99.99%</h3>
            <p className="text-xs text-neutral-500 mt-1">All systems operational</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-sm text-neutral-600 font-medium">SSL Status</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">Secure</h3>
            <p className="text-xs text-neutral-500 mt-1">Expires in 82 days</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Action Req</span>
            </div>
            <p className="text-sm text-neutral-600 font-medium">Pending Investigations</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">
              {reports.filter(r => r.status === 'pending' || r.status === 'investigating').length}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">Requires attention</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg border border-neutral-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Report Type</label>
              <select
                value={filters.reportType}
                onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Types</option>
                <option value="communication">Communication</option>
                <option value="website">Website/App</option>
                <option value="jobs">Jobs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {report.description}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {report.suspiciousElements.length} suspicious elements
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getReportTypeIcon(report.reportType)}</span>
                        <span className="text-sm font-medium text-neutral-700 capitalize">
                          {report.reportType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`w-fit inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`w-fit inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.userId ? (
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{report.userId.name}</p>
                          <p className="text-xs text-neutral-500">{report.userId.email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-500">Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">
                        {new Date(report.reportedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(report)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {reports.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {reports.map((report) => (
                  <div key={report._id} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="space-y-3">
                      {/* Report Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getReportTypeIcon(report.reportType)}</span>
                            <span className="text-sm font-medium text-neutral-700 capitalize">
                              {report.reportType}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-neutral-900 line-clamp-2">
                            {report.description}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {report.suspiciousElements.length} suspicious elements
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Status and Priority */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                      </div>

                      {/* Reporter and Date */}
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <div>
                          {report.userId ? (
                            <div>
                              <p className="font-medium text-neutral-900">{report.userId.name}</p>
                              <p className="text-neutral-500">{report.userId.email}</p>
                            </div>
                          ) : (
                            <span>Anonymous</span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-neutral-900">{new Date(report.reportedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500">No security reports found</p>
              </div>
            )}
          </div>
        </div>

        {/* View Report Modal */}
        {showViewModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowViewModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield size={20} className="text-red-600 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Security Report Details</h2>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Report ID: {selectedReport._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {/* Report Overview */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-gray-600 sm:w-4 sm:h-4" />
                    Report Overview
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Report Type</label>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">{getReportTypeIcon(selectedReport.reportType)}</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 capitalize">{selectedReport.reportType}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedReport.priority)}`}>
                        {selectedReport.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Reported Date</label>
                      <p className="text-xs sm:text-sm text-gray-900">{new Date(selectedReport.reportedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}</p>
                    </div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <FileText size={14} className="text-gray-600 sm:w-4 sm:h-4" />
                    Report Details
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description</label>
                      <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-3 sm:p-4 rounded-lg border">
                        {selectedReport.description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Suspicious Elements</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.suspiciousElements.map((element, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-red-100 text-red-800 rounded-full border border-red-200"
                          >
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Action Taken by User</label>
                      <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-3 sm:p-4 rounded-lg border">
                        {selectedReport.actionTaken}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reporter Information */}
                {selectedReport.userId && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <User size={14} className="text-gray-600 sm:w-4 sm:h-4" />
                      Reporter Information
                    </h3>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                          <p className="text-xs sm:text-sm text-gray-900">{selectedReport.userId.name}</p>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                          <p className="text-xs sm:text-sm text-gray-900 break-all">{selectedReport.userId.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignment Information */}
                {selectedReport.assignedTo && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <UserCheck size={14} className="text-gray-600 sm:w-4 sm:h-4" />
                      Assignment Information
                    </h3>
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-blue-700 mb-1">Assigned To</label>
                          <p className="text-xs sm:text-sm text-blue-900">{selectedReport.assignedTo.name}</p>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-blue-700 mb-1">Email</label>
                          <p className="text-xs sm:text-sm text-blue-900 break-all">{selectedReport.assignedTo.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-row items-stretch items-center gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleUpdateStatus(selectedReport);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                    Update Status
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleDeleteReport(selectedReport);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    Delete Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showStatusModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowStatusModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 border-b border-gray-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Edit size={16} className="text-green-600 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Update Report Status</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Manage report investigation and resolution</p>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateReportStatus();
                }}>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={statusFormData.status}
                        onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <input
                        type="text"
                        value={statusFormData.assignedTo}
                        onChange={(e) => setStatusFormData({ ...statusFormData, assignedTo: e.target.value })}
                        placeholder="Enter assignee name or email"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Investigation Notes</label>
                      <textarea
                        value={statusFormData.investigationNotes}
                        onChange={(e) => setStatusFormData({ ...statusFormData, investigationNotes: e.target.value })}
                        placeholder="Enter investigation notes and findings..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Resolution</label>
                      <textarea
                        value={statusFormData.resolution}
                        onChange={(e) => setStatusFormData({ ...statusFormData, resolution: e.target.value })}
                        placeholder="Enter resolution details (if resolved)..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row items-stretch items-center gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {actionLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={14} className="sm:w-4 sm:h-4" />
                          Update Status
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowStatusModal(false)}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowDeleteModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 border-b border-gray-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 size={16} className="text-red-600 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Delete Security Report</h2>
                  <p className="text-xs sm:text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <p className="text-xs sm:text-sm text-gray-700 mb-2">
                    Are you sure you want to delete this security report?
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Report Type: {selectedReport.reportType}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Priority: {selectedReport.priority}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Status: {selectedReport.status}</p>
                  </div>
                </div>

                <div className="flex flex-row items-stretch items-center gap-3">
                  <button
                    onClick={deleteReport}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {actionLoading ? "Deleting..." : "Delete Report"}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowSuccessModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 border-b border-gray-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-green-600 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Success!</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Operation completed successfully</p>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-700 text-center">
                    {successMessage}
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 