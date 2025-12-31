"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { translate } from "@/utils/translate";
import {
    DollarSign, Search, Filter, ChevronLeft, ChevronRight, Loader2,
    CheckCircle2, Clock, XCircle, TrendingUp
} from "lucide-react";

interface Commission {
    _id: string;
    type: "registration" | "purchase" | "bonus" | "tier_upgrade";
    amount: number;
    status: "pending" | "approved" | "paid" | "rejected";
    description: string;
    calculatedAt: string;
    approvedAt?: string;
    paidAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    metadata?: {
        orderValue?: number;
        commissionRate?: number;
        autoApproved?: boolean;
    };
}

export default function CommissionsPage() {
    const router = useRouter();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    useEffect(() => {
        fetchCommissions();
    }, [page, statusFilter, typeFilter]);

    const fetchCommissions = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(statusFilter !== "all" && { status: statusFilter }),
                ...(typeFilter !== "all" && { type: typeFilter }),
            });

            const response = await apiGet<{
                status: string;
                data: {
                    commissions: Commission[];
                    pagination: { page: number; limit: number; total: number; pages: number };
                };
            }>(`/api/v1/commissions/list?${params}`);

            setCommissions(response.data.commissions);
            setTotalPages(response.data.pagination.pages);
        } catch (error: any) {
            toast(error.message || translate("agent.toasts.loadCommissionsError"), "error");
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
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "paid":
                return <CheckCircle2 className="h-4 w-4" />;
            case "approved":
                return <TrendingUp className="h-4 w-4" />;
            case "pending":
                return <Clock className="h-4 w-4" />;
            case "rejected":
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const labels = {
            registration: translate("agent.types.registration"),
            purchase: translate("agent.types.purchase"),
            bonus: translate("agent.types.bonus"),
            tier_upgrade: translate("agent.types.tier_upgrade"),
        };
        return labels[type as keyof typeof labels] || type;
    };

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
                        {translate("agent.commissions.backToDashboard")}
                    </button>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                        {translate("agent.commissions.title")}
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        {translate("agent.commissions.subtitle")}
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <option value="all">{translate("agent.commissions.filters.allStatus")}</option>
                                <option value="paid">{translate("agent.status.paid")}</option>
                                <option value="approved">{translate("agent.status.approved")}</option>
                                <option value="pending">{translate("agent.status.pending")}</option>
                                <option value="rejected">{translate("agent.status.rejected")}</option>
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                            >
                                <option value="all">{translate("agent.commissions.filters.allTypes")}</option>
                                <option value="registration">{translate("agent.types.registration")}</option>
                                <option value="purchase">{translate("agent.types.purchase")}</option>
                                <option value="bonus">{translate("agent.types.bonus")}</option>
                                <option value="tier_upgrade">{translate("agent.types.tier_upgrade")}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Commissions Table */}
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : commissions.length === 0 ? (
                        <div className="text-center py-12">
                            <DollarSign className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600 dark:text-neutral-400">{translate("agent.commissions.noCommissions")}</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.commissions.table.date")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.commissions.table.type")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.commissions.table.description")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.commissions.table.amount")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                {translate("agent.commissions.table.status")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {commissions.map((commission) => (
                                            <tr key={commission._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                                    {formatDate(commission.calculatedAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                                                        {getTypeBadge(commission.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-neutral-900 dark:text-white max-w-xs truncate">
                                                    {commission.description}
                                                    {commission.metadata?.autoApproved && (
                                                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                                            {translate("agent.commissions.autoApproved")}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                                                    {formatCurrency(commission.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                                                                commission.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(commission.status)}
                                                            {translate(`agent.status.${commission.status}`)}
                                                        </span>
                                                    </div>
                                                    {commission.status === "rejected" && commission.rejectionReason && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                            {commission.rejectionReason}
                                                        </p>
                                                    )}
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
