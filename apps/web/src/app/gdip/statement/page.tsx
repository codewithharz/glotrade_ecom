"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Printer,
    Calendar,
    TrendingUp,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Globe,
    Loader2,
    Filter,
    Download,
    History as HistoryIcon,
    Sparkles,
    Activity,
    Trophy,
    Search,
    CheckCircle2
} from "lucide-react";
import { apiGet } from "@/utils/api";

interface Transaction {
    _id: string;
    type: string;
    category: string;
    amount: number;
    currency: string;
    balanceBefore: number;
    balanceAfter: number;
    status: string;
    reference: string;
    description: string;
    processedAt: string;
    createdAt: string;
}

interface StatementData {
    transactions: Transaction[];
    summary: {
        totalInvested: number;
        totalEarned: number;
        currentBalance: number;
    };
}

export default function AccountStatementPage() {
    const router = useRouter();
    const [data, setData] = useState<StatementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("all");

    useEffect(() => {
        const fetchStatement = async () => {
            setLoading(true);
            try {
                // Fetch all transactions for the user
                // We filter for GDIP related transactions (order_payment, top_up, commission, etc.)
                const response = await apiGet<any>("/api/v1/wallets/transactions?limit=100");
                if (response.status === "success") {
                    const txs = response.data.transactions;

                    // Calculate summary based on transactions
                    const totalInvested = txs
                        .filter((t: any) => t.category === "order_payment" && t.amount < 0)
                        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

                    const totalEarned = txs
                        .filter((t: any) => t.type === "deposit" && (t.category === "commission" || t.description.toLowerCase().includes("profit")))
                        .reduce((sum: number, t: any) => sum + t.amount, 0);

                    // Get current balance from first transaction or wallet summary
                    const walletResponse = await apiGet<any>("/api/v1/wallets/summary");
                    const currentBalance = walletResponse.data?.ngnWallet?.available || 0;

                    setData({
                        transactions: txs,
                        summary: {
                            totalInvested,
                            totalEarned,
                            currentBalance
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching statement data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatement();
    }, [dateRange]);
    const formatCurrency = (amount: number, minimumFractionDigits = 0) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits,
            maximumFractionDigits: minimumFractionDigits,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).toUpperCase();
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Preparing Account Statement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Action Bar - Hidden on Print */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 print:hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                    <div className="w-full sm:w-auto">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-xs uppercase tracking-widest transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return to Dashboard
                        </button>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase mb-2">
                            Global Ledger
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Comprehensive account statement and transaction history
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full sm:w-auto appearance-none bg-gray-50 border border-transparent rounded-xl px-4 py-3 pr-10 text-xs font-bold uppercase tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value="all">COMPREHENSIVE HISTORY</option>
                                <option value="30days">LAST 30 OPERATIONAL DAYS</option>
                                <option value="90days">QUARTERLY ARCHIVE</option>
                                <option value="thisyear">ANNUAL RECORD</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                        </div>

                        <button
                            onClick={handlePrint}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all active:scale-95"
                        >
                            <Download size={14} />
                            Download Ledger
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-x border-t border-gray-100 bg-white shadow-2xl rounded-t-3xl overflow-hidden print:shadow-none print:rounded-none print:border-none">
                {/* Header Document Style */}
                <div className="p-8 sm:p-12 border-b border-gray-100 bg-gray-50/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                                <Globe size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 leading-none tracking-tight">GLOTRADE</h2>
                                <p className="text-[10px] font-black text-blue-600 tracking-[0.3em] uppercase mt-2">INTERNATIONAL PLATFORM</p>
                                <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">Trade Finance & Digital Assets</p>
                            </div>
                        </div>

                        <div className="text-left sm:text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 leading-none">STATEMENT PERIOD</p>
                            <p className="text-xl font-black text-gray-900 leading-none uppercase tracking-tight">
                                {dateRange === "all" ? "Comprehensive History" : `Filtered: ${dateRange}`}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-3 whitespace-nowrap uppercase tracking-widest">Generated On {formatDate(new Date().toISOString())}</p>
                        </div>
                    </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-b border-gray-100">
                    <div className="p-8 group hover:bg-gray-50/50 transition-all relative overflow-hidden">
                        <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-gray-900 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 leading-none">TOTAL INVESTMENT</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-gray-900 leading-none tracking-tight">{formatCurrency(data?.summary?.totalInvested || 0)}</span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 mb-0.5">
                                <Activity size={10} /> ACTIVE
                            </span>
                        </div>
                    </div>
                    <div className="p-8 group hover:bg-emerald-50/10 transition-all relative overflow-hidden">
                        <TrendingUp className="absolute -top-4 -right-4 w-24 h-24 text-emerald-900 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 leading-none">TOTAL ROI EARNED</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-emerald-600 leading-none tracking-tight">{formatCurrency(data?.summary?.totalEarned || 0)}</span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 mb-0.5">
                                +{data?.summary && data.summary.totalEarned > 0 && data.summary.totalInvested > 0 ? ((data.summary.totalEarned / data.summary.totalInvested) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                    </div>
                    <div className="p-8 group hover:bg-indigo-50/10 transition-all bg-gray-50/30 relative overflow-hidden">
                        <Wallet className="absolute -top-4 -right-4 w-24 h-24 text-indigo-900 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 leading-none">WALLET BALANCE</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-gray-900 leading-none tracking-tight">{formatCurrency(data?.summary?.currentBalance || 0)}</span>
                            <Trophy className="text-indigo-400 mb-0.5" size={16} />
                        </div>
                    </div>
                </div>

                {/* Transaction Ledger */}
                <div className="p-0">
                    {/* Data Visualization for Desktop */}
                    <div className="hidden sm:block">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Lifecycle / Time</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Transaction Entity</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Reference</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Yield Value</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">New Reserve</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.transactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{formatDate(tx.createdAt)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{formatTime(tx.createdAt)}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${tx.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                                                    }`}>
                                                    {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                </div>
                                                <div className="max-w-md">
                                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{tx.description}</p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{tx.category.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-[10px] text-gray-400 uppercase select-all group-hover:text-blue-600 transition-colors tracking-tight">
                                            {tx.reference}
                                        </td>
                                        <td className={`px-8 py-6 text-right font-black whitespace-nowrap text-sm tracking-tight ${tx.amount > 0 ? "text-emerald-600" : "text-gray-900"
                                            }`}>
                                            {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-8 py-6 text-right text-xs font-black text-gray-400 group-hover:text-gray-900 transition-colors tracking-tight">
                                            {formatCurrency(tx.balanceAfter)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Sequence */}
                    <div className="sm:hidden grid grid-cols-1 gap-4 p-4 mt-2">
                        {data?.transactions.map((tx) => (
                            <div key={tx._id} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 relative overflow-hidden group active:bg-white transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl">
                                        <p className="text-[10px] font-black text-gray-900 leading-none">{formatDate(tx.createdAt)}</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tx.amount > 0 ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-gray-900 text-white shadow-lg"
                                        }`}>
                                        {tx.amount > 0 ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">TRANSACTION ENTITY</p>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-normal">{tx.description}</p>
                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 bg-blue-50/50 px-2 py-0.5 rounded-md inline-block">
                                        {tx.category.replace('_', ' ')}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100/50">
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">VALUE CHANGE</p>
                                        <p className={`text-base font-black tracking-tight ${tx.amount > 0 ? "text-emerald-600" : "text-gray-900"}`}>
                                            {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">NEW RESERVE</p>
                                        <p className="text-base font-black text-gray-900 tracking-tight">
                                            {formatCurrency(tx.balanceAfter)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100/50 flex items-center justify-between">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">REF: <span className="text-gray-600 select-all">{tx.reference}</span></p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatTime(tx.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {data?.transactions.length === 0 && (
                        <div className="px-8 py-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <HistoryIcon className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 uppercase">No Data Located</h3>
                            <p className="text-gray-500 font-medium max-w-xs mx-auto text-sm">No historical sequences found within this specified timeline.</p>
                        </div>
                    )}
                </div>

                {/* Closing Footer */}
                <div className="p-12 bg-gray-900 text-white rounded-b-3xl print:bg-white print:text-gray-900 print:rounded-none">
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-12">
                        <div className="w-full sm:max-w-xl">
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 leading-none">OFFICIAL ARCHIVE NOTICE</p>
                            <p className="text-base text-gray-400 leading-relaxed print:text-gray-600 font-black uppercase tracking-tight">
                                This account ledger is an official record of activities on the Glotrade International Platform.
                            </p>
                            <p className="text-xs text-gray-500 mt-4 leading-relaxed font-bold uppercase tracking-widest">
                                All entries are cross-verified with physical commodity movement and digital asset custody protocols. Report discrepancies to <span className="text-blue-400 underline">COMPLIANCE@GLOTRADE.COM</span> within 48 operational hours.
                            </p>
                        </div>

                        <div className="text-left sm:text-right w-full sm:w-auto">
                            <div className="mb-6">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2 leading-none">TOTAL PORTFOLIO ARCHIVE</p>
                                <p className="text-5xl font-black text-white print:text-gray-900 leading-none tracking-tight">
                                    {formatCurrency((data?.summary.currentBalance || 0) + (data?.summary.totalInvested || 0))}
                                </p>
                            </div>
                            <div className="flex items-center sm:justify-end gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">
                                <CheckCircle2 size={12} className="animate-pulse" /> SECURE LEDGER VERIFIED
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 mb-12 text-center print:mt-16">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] leading-none">
                    GLOTRADE INTERNATIONAL PLATFORM • END OF RECORDED DATA
                </p>
            </div>
        </div>
    );
}

// End of Statement Component
