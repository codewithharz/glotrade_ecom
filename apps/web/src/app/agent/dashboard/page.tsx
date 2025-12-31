"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { translate } from "@/utils/translate";
import {
    Users, TrendingUp, DollarSign, Award, Copy, Share2,
    ExternalLink, CheckCircle2, Clock, XCircle, Loader2
} from "lucide-react";

interface AgentStats {
    totalReferrals: number;
    activeReferrals: number;
    totalCommissionEarned: number;
    pendingCommission: number;
    tier: "Bronze" | "Silver" | "Gold";
}

interface CommissionSummary {
    totalEarned: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: {
        registration: number;
        purchase: number;
        bonus: number;
    };
    totalCommissions: number;
}

interface ReferralStats {
    totalReferrals: number;
    activeReferrals: number;
    pendingReferrals: number;
    totalOrders: number;
    totalOrderValue: number;
    totalCommission: number;
    conversionRate: number;
    avgOrderValue: number;
}

export default function AgentDashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [referralCode, setReferralCode] = useState("");
    const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
    const [commissionSummary, setCommissionSummary] = useState<CommissionSummary | null>(null);
    const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);

            // Fetch referral code and agent stats
            const codeResponse = await apiGet<{ status: string; data: { referralCode: string; agentStats: AgentStats } }>(
                "/api/v1/referrals/my-code"
            );
            setReferralCode(codeResponse.data.referralCode);
            setAgentStats(codeResponse.data.agentStats);

            // Fetch commission summary
            const commissionResponse = await apiGet<{ status: string; data: CommissionSummary }>(
                "/api/v1/commissions/summary"
            );
            setCommissionSummary(commissionResponse.data);

            // Fetch referral stats
            const statsResponse = await apiGet<{ status: string; data: ReferralStats }>(
                "/api/v1/referrals/stats"
            );
            setReferralStats(statsResponse.data);

        } catch (error: any) {
            console.error("Failed to fetch dashboard data:", error);
            toast(error.message || translate("agent.toasts.loadDashboardError"), "error");
        } finally {
            setIsLoading(false);
        }
    };

    const copyReferralCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast(translate("agent.toasts.copied"), "success");
        setTimeout(() => setCopied(false), 2000);
    };

    const shareReferralLink = () => {
        const link = `${window.location.origin}/auth/register-business?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        toast(translate("agent.toasts.linkCopied"), "success");
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount); // Amount is already in Naira
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "Gold":
                return "bg-yellow-500 text-yellow-900";
            case "Silver":
                return "bg-gray-400 text-gray-900";
            default:
                return "bg-orange-600 text-white";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">{translate("agent.dashboard.loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                        {translate("agent.dashboard.title")}
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        {translate("agent.dashboard.subtitle")}
                    </p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Referrals */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor(agentStats?.tier || "Bronze")}`}>
                                {agentStats?.tier || "Bronze"}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                            {agentStats?.totalReferrals || 0}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {translate("agent.dashboard.stats.totalReferrals")}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            {translate("agent.dashboard.stats.activeCount", { count: agentStats?.activeReferrals || 0 })}
                        </p>
                    </div>

                    {/* Total Earned */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                            {formatCurrency(commissionSummary?.totalEarned || 0)}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {translate("agent.dashboard.stats.totalEarned")}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                            {translate("agent.dashboard.stats.commissionsCount", { count: commissionSummary?.totalCommissions || 0 })}
                        </p>
                    </div>

                    {/* Pending Commission */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                            {formatCurrency(commissionSummary?.pending || 0)}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {translate("agent.dashboard.stats.pendingCommission")}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                            {translate("agent.dashboard.stats.awaitingApproval")}
                        </p>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                            {referralStats?.conversionRate.toFixed(1) || 0}%
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {translate("agent.dashboard.stats.conversionRate")}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                            {translate("agent.dashboard.stats.pendingToActive")}
                        </p>
                    </div>
                </div>

                {/* Referral Tools Card */}
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800 mb-8">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                        {translate("agent.dashboard.tools.title")}
                    </h2>

                    <div className="space-y-4">
                        {/* Referral Code */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                {translate("agent.dashboard.tools.codeLabel")}
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={referralCode}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-mono text-lg"
                                    />
                                </div>
                                <button
                                    onClick={copyReferralCode}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle2 className="h-5 w-5" />
                                            {translate("agent.dashboard.tools.copied")}
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-5 w-5" />
                                            {translate("agent.dashboard.tools.copy")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                {translate("agent.dashboard.tools.linkLabel")}
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={`${window.location.origin}/auth/register-business?ref=${referralCode}`}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm"
                                    />
                                </div>
                                <button
                                    onClick={shareReferralLink}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Share2 className="h-5 w-5" />
                                    {translate("agent.dashboard.tools.share")}
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            <button
                                onClick={() => router.push("/agent/referrals")}
                                className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Users className="h-5 w-5" />
                                {translate("agent.dashboard.tools.viewReferrals")}
                            </button>
                            <button
                                onClick={() => router.push("/agent/commissions")}
                                className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <DollarSign className="h-5 w-5" />
                                {translate("agent.dashboard.tools.commissions")}
                            </button>
                            <button
                                onClick={() => router.push("/profile/wallet")}
                                className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Award className="h-5 w-5" />
                                {translate("agent.dashboard.tools.wallet")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Commission Breakdown */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                            {translate("agent.dashboard.breakdown.title")}
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {translate("agent.dashboard.breakdown.registration")}
                                </span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                    {formatCurrency(commissionSummary?.byType.registration || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {translate("agent.dashboard.breakdown.purchase")}
                                </span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                    {formatCurrency(commissionSummary?.byType.purchase || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {translate("agent.dashboard.breakdown.bonus")}
                                </span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                    {formatCurrency(commissionSummary?.byType.bonus || 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Referral Performance */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                            {translate("agent.dashboard.performance.title")}
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {translate("agent.dashboard.performance.totalOrders")}
                                </span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                    {referralStats?.totalOrders || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {translate("agent.dashboard.performance.totalOrderValue")}
                                </span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                    {formatCurrency(referralStats?.totalOrderValue || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {translate("agent.dashboard.performance.avgOrderValue")}
                                </span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                    {formatCurrency(referralStats?.avgOrderValue || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
