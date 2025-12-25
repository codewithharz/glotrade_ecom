"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";

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
    profitMode: "TPM" | "EPS";
    status: string;
    cyclesCompleted: number;
    insuranceCertificateNumber: string;
    commodityType: string;
    purchasedAt: string;
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        GDIP Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Glotrade Distribution/Trusted Insured Partners Platform
                    </p>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        {/* Total TPIAs */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
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
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
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
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
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
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
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
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">Wallet Balance</h3>
                            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(walletBalance)}</p>
                            {walletBalance < 1000000 && (
                                <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
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
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Purchase New TPIA
                        </button>

                        <button
                            onClick={() => router.push("/gdip/tpias")}
                            className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View All TPIAs
                        </button>

                        <button
                            onClick={() => router.push("/gdip/cycles")}
                            className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
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
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                            View All →
                        </button>
                    </div>

                    {tpias.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
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
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Profit:</span>
                                            <span className="font-medium text-green-600">+{formatCurrency(tpia.totalProfitEarned)}</span>
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
