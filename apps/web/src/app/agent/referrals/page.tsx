"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { translate } from "@/utils/translate";
import { Users, Search, Filter, ChevronLeft, ChevronRight, Loader2, TrendingUp, ShoppingCart } from "lucide-react";

interface Referral {
    _id: string;
    referredUserId: {
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
    status: "pending" | "active" | "inactive";
    registeredAt: string;
    firstPurchaseAt?: string;
    totalOrders: number;
    totalOrderValue: number;
    totalCommissionGenerated: number;
}

export default function ReferralsPage() {
    const router = useRouter();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchReferrals();
    }, [page, statusFilter]);

    const fetchReferrals = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(statusFilter !== "all" && { status: statusFilter }),
            });

            const response = await apiGet<{
                status: string;
                data: {
                    referrals: Referral[];
                    pagination: { page: number; limit: number; total: number; pages: number };
                };
            }>(`/api/v1/referrals/list?${params}`);

            setReferrals(response.data.referrals);
            setTotalPages(response.data.pagination.pages);
        } catch (error: any) {
            toast(error.message || translate("agent.toasts.loadReferralsError"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount); // Amount is already in Naira
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    const filteredReferrals = referrals.filter((ref) =>
        searchTerm
            ? ref.referredUserId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ref.referredUserId.email.toLowerCase().includes(searchTerm.toLowerCase())
            : true
    );

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/agent/dashboard")}
                        className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-4"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        {translate("agent.referrals.backToDashboard")}
                    </button>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                        {translate("agent.referrals.title")}
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        {translate("agent.referrals.subtitle")}
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder={translate("agent.referrals.searchPlaceholder")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                            >
                                <option value="all">{translate("agent.referrals.filters.allStatus")}</option>
                                <option value="active">{translate("agent.status.active")}</option>
                                <option value="pending">{translate("agent.status.pending")}</option>
                                <option value="inactive">{translate("agent.status.inactive")}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Referrals Table */}
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredReferrals.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600 dark:text-neutral-400">{translate("agent.referrals.noReferrals")}</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.referrals.table.user")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.referrals.table.status")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.referrals.table.registered")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.referrals.table.orders")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.referrals.table.orderValue")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.referrals.table.commission")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {filteredReferrals.map((referral) => (
                                            <tr key={referral._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                                            {referral.referredUserId.username}
                                                        </div>
                                                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                                            {referral.referredUserId.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                                                            referral.status
                                                        )}`}
                                                    >
                                                        {translate(`agent.status.${referral.status}`)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                                    {formatDate(referral.registeredAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-neutral-900 dark:text-white">
                                                        <ShoppingCart className="h-4 w-4" />
                                                        {referral.totalOrders}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                                                    {formatCurrency(referral.totalOrderValue)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                                                    {formatCurrency(referral.totalCommissionGenerated)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {translate("wallet.transactions.pagination.pageOffset", { page, pages: totalPages })}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
