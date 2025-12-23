"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Users,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Shield,
    Ban,
    CheckCircle,
    XCircle,
    Award,
    DollarSign,
    TrendingUp
} from "lucide-react";

interface SalesAgent {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    isBlocked: boolean;
    createdAt: string;
    businessInfo: {
        businessType: string;
        referralCode: string;
        agentStats: {
            totalReferrals: number;
            activeReferrals: number;
            totalCommissionEarned: number;
            pendingCommission: number;
            tier: string;
        };
    };
}

export default function SalesAgentsPage() {
    const router = useRouter();
    const [agents, setAgents] = useState<SalesAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const [selectedAgent, setSelectedAgent] = useState<SalesAgent | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);

    const fetchAgents = async (page = 1) => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                businessType: "Sales Agent"
            });

            if (searchTerm) {
                params.append("search", searchTerm);
            }

            const response = await apiGet<{
                status: string;
                data: {
                    users: SalesAgent[];
                    total: number;
                    page: number;
                    totalPages: number;
                };
            }>(`/api/v1/admin/users?${params}`);

            if (response.data) {
                setAgents(response.data.users);
                setPagination({
                    page: response.data.page,
                    limit: 10, // Assuming fixed limit for now or from response if available
                    total: response.data.total,
                    totalPages: response.data.totalPages
                });
            }
        } catch (error) {
            console.error("Failed to fetch sales agents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents(1);
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAgents(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchAgents(newPage);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    const AgentDetailsModal = () => {
        useEffect(() => {
            const fetchWallet = async () => {
                if (!selectedAgent) return;
                try {
                    const res = await apiGet(`/api/v1/wallets/summary?userId=${selectedAgent._id}`) as any;
                    if (res.data?.ngnWallet?.balance !== undefined) {
                        setWalletBalance(res.data.ngnWallet.balance);
                    }
                } catch (error) {
                    console.error("Error fetching wallet:", error);
                }
            };
            fetchWallet();
        }, [selectedAgent]);

        if (!selectedAgent) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowViewModal(false)}>
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Agent Details</h2>
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <XCircle size={20} className="text-gray-500 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
                        <div className="space-y-4 sm:space-y-6">
                            {/* Header */}
                            <div className="flex flex-row items-center gap-3 sm:gap-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-2xl">
                                    {(selectedAgent.firstName?.[0] || selectedAgent.username?.[0] || "A").toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                        {selectedAgent.firstName} {selectedAgent.lastName}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600 truncate">{selectedAgent.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            Sales Agent
                                        </span>
                                        {selectedAgent.isVerified ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <Shield className="w-3 h-3" /> Unverified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Total Commission</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(selectedAgent.businessInfo?.agentStats?.totalCommissionEarned || 0)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Pending Commission</p>
                                    <p className="text-xl font-bold text-yellow-600">
                                        {formatCurrency(selectedAgent.businessInfo?.agentStats?.pendingCommission || 0)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Wallet Balance</p>
                                    <p className="text-xl font-bold text-purple-600">
                                        {walletBalance !== null ? `₦${walletBalance.toLocaleString()}` : 'Loading...'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Referrals</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {selectedAgent.businessInfo?.agentStats?.totalReferrals || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Business Info */}
                            <div className="bg-indigo-50 rounded-lg p-4">
                                <h4 className="font-medium text-indigo-900 mb-3">Agent Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs font-medium text-indigo-800">Referral Code</span>
                                        <p className="text-sm text-indigo-700 font-mono">{selectedAgent.businessInfo?.referralCode}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-indigo-800">Tier</span>
                                        <p className="text-sm text-indigo-700">{selectedAgent.businessInfo?.agentStats?.tier || 'Bronze'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-indigo-800">Joined</span>
                                        <p className="text-sm text-indigo-700">{formatDate(selectedAgent.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => router.push(`/admin/users?search=${encodeURIComponent(selectedAgent.email)}`)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                    View in Users List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sales Agents</h1>
                        <p className="text-gray-500 mt-1">Manage sales agents and view their performance</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search agents by name, email or referral code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Agents Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Agent</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Referral Code</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Tier</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Referrals</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Commission Earned</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Pending</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                                                Loading agents...
                                            </div>
                                        </td>
                                    </tr>
                                ) : agents.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            No sales agents found
                                        </td>
                                    </tr>
                                ) : (
                                    agents.map((agent) => (
                                        <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                        {(agent.firstName?.[0] || agent.username?.[0] || "A").toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {agent.firstName} {agent.lastName}
                                                        </p>
                                                        <p className="text-gray-500 text-xs">{agent.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                                                    {agent.businessInfo?.referralCode || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {agent.businessInfo?.agentStats?.tier ? (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${agent.businessInfo.agentStats.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                                                            agent.businessInfo.agentStats.tier === 'Silver' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-orange-100 text-orange-800'}`}>
                                                        <Award className="w-3 h-3" />
                                                        {agent.businessInfo.agentStats.tier}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {agent.businessInfo?.agentStats?.totalReferrals || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {agent.businessInfo?.agentStats?.activeReferrals || 0} active
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-green-600">
                                                    {formatCurrency(agent.businessInfo?.agentStats?.totalCommissionEarned || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-yellow-600">
                                                    {formatCurrency(agent.businessInfo?.agentStats?.pendingCommission || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {agent.isBlocked ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <Ban className="w-3 h-3" />
                                                        Blocked
                                                    </span>
                                                ) : agent.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <Shield className="w-3 h-3" />
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAgent(agent);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} agents
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {showViewModal && <AgentDetailsModal />}
            </div>
        </AdminLayout>
    );
}
