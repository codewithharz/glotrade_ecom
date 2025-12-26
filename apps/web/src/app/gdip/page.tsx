"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import {
    Plus,
    Layers,
    Wallet,
    TrendingUp,
    ShieldCheck,
    Activity,
    LayoutGrid,
    AlertTriangle,
    Inbox,
    ArrowRight,
    FileText
} from "lucide-react";

interface PortfolioSummary {
    totalTPIAs: number;
    totalInvested: number;
    currentValue: number;
    totalProfitEarned: number;
    activeCycles: number;
    tpiasByStatus: {
        pending: number;
        active: number;
        matured: number;
        suspended: number;
    };
    tpiasByMode: {
        TPM: number;
        EPS: number;
    };
    gdcs: number;
}

interface TPIA {
    _id: string;
    tpiaId: string;
    tpiaNumber: number;
    partnerName: string;
    gdcNumber: number;
    positionInGDC: number;
    purchasePrice: number;
    currentValue: number;
    totalProfitEarned: number;
    estimatedProfit?: number;
    profitMode: "TPM" | "EPS";
    status: string;
    cyclesCompleted: number;
    insuranceCertificateNumber: string;
    commodityType: string;
    purchasedAt: string;
    currentCycleId?: {
        startDate: string;
        endDate: string;
        status: string;
        targetProfitRate: number;
    };
}

export default function GDIPDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<PortfolioSummary | null>(null);
    const [tpias, setTPIAs] = useState<TPIA[]>([]);
    const [error, setError] = useState("");
    const [walletBalance, setWalletBalance] = useState<number>(0);

    useEffect(() => {
        fetchPortfolio();
        fetchWalletBalance();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: { summary: PortfolioSummary; tpias: TPIA[] } }>("/api/v1/gdip/portfolio");

            if (response.success) {
                setSummary(response.data.summary);
                setTPIAs(response.data.tpias);
            }
        } catch (err: any) {
            console.error("Error fetching portfolio:", err);
            setError(err.message || "Failed to load portfolio");
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const response = await apiGet<{ data: { ngnWallet: { available: number } } }>("/api/v1/wallets/summary");
            if (response.data?.ngnWallet?.available !== undefined) {
                setWalletBalance(response.data.ngnWallet.available);
            }
        } catch (err: any) {
            console.error("Error fetching wallet balance:", err);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    const calculateROI = () => {
        if (!summary || summary.totalInvested === 0) return 0;
        return ((summary.totalProfitEarned / summary.totalInvested) * 100).toFixed(2);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                GDIP Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Glotrade Distribution/Trusted Insured Partners Platform
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/gdip/statement')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95"
                        >
                            <FileText size={18} />
                            Generate Statement
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        {/* Total TPIAs */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Layers className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Total TPIAs</h3>
                            <p className="text-3xl font-bold text-gray-900">{summary.totalTPIAs}</p>
                            <p className="text-sm text-gray-500 mt-2">Across {summary.gdcs} GDCs</p>
                        </div>

                        {/* Total Invested */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Wallet className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Invested</h3>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalInvested)}</p>
                            <p className="text-sm text-gray-500 mt-2">Capital deployed</p>
                        </div>

                        {/* Total Profit */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Profit Earned</h3>
                            <p className="text-3xl font-bold text-green-600">{formatCurrency(summary.totalProfitEarned)}</p>
                            <p className="text-sm text-gray-500 mt-2">ROI: {calculateROI()}%</p>
                        </div>

                        {/* Current Value */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <ShieldCheck className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Current Portfolio Value</h3>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.currentValue)}</p>
                            <p className="text-sm text-green-600 mt-2">
                                +{formatCurrency(summary.currentValue - summary.totalInvested)}
                            </p>
                        </div>

                        {/* Wallet Balance */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-100 rounded-lg">
                                    <Wallet className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Wallet Balance</h3>
                            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(walletBalance)}</p>
                            {walletBalance < 1000000 && (
                                <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Low balance
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push("/gdip/purchase")}
                            className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Purchase New TPIA
                        </button>

                        <button
                            onClick={() => router.push("/gdip/tpias")}
                            className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg"
                        >
                            <LayoutGrid className="w-5 h-5" />
                            View All TPIAs
                        </button>

                        <button
                            onClick={() => router.push("/gdip/cycles")}
                            className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                        >
                            <Activity className="w-5 h-5" />
                            Trade Cycles
                        </button>
                    </div>
                </div>

                {/* Recent TPIAs */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your TPIAs</h2>
                        <button
                            onClick={() => router.push("/gdip/tpias")}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {tpias.length === 0 ? (
                        <div className="text-center py-12">
                            <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No TPIAs Yet</h3>
                            <p className="text-gray-600 mb-4">Start your investment journey by purchasing your first TPIA</p>
                            <button
                                onClick={() => router.push("/gdip/purchase")}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Purchase TPIA
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tpias.slice(0, 6).map((tpia) => (
                                <div
                                    key={tpia._id}
                                    onClick={() => router.push(`/gdip/tpia/${tpia._id}`)}
                                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg text-gray-900">{tpia.tpiaId}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${tpia.status === "active" ? "bg-green-100 text-green-700" :
                                            tpia.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-gray-100 text-gray-700"
                                            }`}>
                                            {tpia.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">GDC:</span>
                                            <span className="font-medium">GDC-{tpia.gdcNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Invested:</span>
                                            <span className="font-medium">{formatCurrency(tpia.purchasePrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Current Value:</span>
                                            <span className="font-medium text-green-600">{formatCurrency(tpia.currentValue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500 font-medium">Profit</span>
                                            <span className="text-sm font-bold text-green-600">
                                                {formatCurrency(tpia.estimatedProfit || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mode:</span>
                                            <span className={`font-medium ${tpia.profitMode === "TPM" ? "text-purple-600" : "text-blue-600"}`}>
                                                {tpia.profitMode}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cycles:</span>
                                            <span className="font-medium">{tpia.cyclesCompleted}</span>
                                        </div>

                                        {tpia.status === "active" && tpia.currentCycleId && (
                                            <div className="pt-2">
                                                <div className="flex justify-between items-center mb-1 text-[10px]">
                                                    <span className="text-gray-500 uppercase tracking-wider font-semibold">Cycle Progress</span>
                                                    <span className="text-blue-600 font-bold">
                                                        {(() => {
                                                            if (!tpia.currentCycleId?.startDate || !tpia.currentCycleId?.endDate) {
                                                                return "0";
                                                            }
                                                            const start = new Date(tpia.currentCycleId.startDate).getTime();
                                                            const end = new Date(tpia.currentCycleId.endDate).getTime();
                                                            const now = Date.now();
                                                            if (isNaN(start) || isNaN(end) || end <= start) {
                                                                return "0";
                                                            }
                                                            const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                                                            return progress.toFixed(1);
                                                        })()}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                                                        style={{
                                                            width: `${(() => {
                                                                if (!tpia.currentCycleId?.startDate || !tpia.currentCycleId?.endDate) {
                                                                    return 0;
                                                                }
                                                                const start = new Date(tpia.currentCycleId.startDate).getTime();
                                                                const end = new Date(tpia.currentCycleId.endDate).getTime();
                                                                const now = Date.now();
                                                                if (isNaN(start) || isNaN(end) || end <= start) {
                                                                    return 0;
                                                                }
                                                                return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                                                            })()}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
