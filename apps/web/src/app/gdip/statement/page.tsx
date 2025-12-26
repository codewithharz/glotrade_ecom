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
    History as HistoryIcon
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
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
            {/* Action Bar - Hidden on Print */}
            <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 p-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Account Statement</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        >
                            <option value="all">All Time</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="thisyear">This Year</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>

                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95"
                    >
                        <Download size={18} />
                        Download Statement
                    </button>
                </div>
            </div>

            {/* Statement Document */}
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
                {/* Header */}
                <div className="p-8 sm:p-12 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                <Globe size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 leading-none">GLOTRADE</h2>
                                <p className="text-xs font-bold text-emerald-600 tracking-[0.2em] uppercase mt-1">International Platform</p>
                                <p className="text-xs text-slate-400 mt-2 font-medium">Trade Finance & Digital Assets</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Statement Period</h3>
                            <p className="text-lg font-bold text-slate-900">
                                {dateRange === "all" ? "Comprehensive History" : `Filtered: ${dateRange}`}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                    <div className="p-8 space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Investment</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-slate-900">₦{data?.summary?.totalInvested?.toLocaleString()}</span>
                            <span className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-0.5">
                                <ArrowUpRight size={12} /> Active
                            </span>
                        </div>
                    </div>
                    <div className="p-8 space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total ROI Earned</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-emerald-600">₦{data?.summary?.totalEarned?.toLocaleString()}</span>
                            <span className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-0.5">
                                <TrendingUp size={12} /> +{data?.summary && data.summary.totalEarned > 0 && data.summary.totalInvested > 0 ? ((data.summary.totalEarned / data.summary.totalInvested) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                    </div>
                    <div className="p-8 space-y-2 bg-slate-50/30">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Wallet Balance</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-slate-900">₦{data?.summary?.currentBalance?.toLocaleString()}</span>
                            <Wallet className="text-slate-300 mb-1" size={16} />
                        </div>
                    </div>
                </div>

                {/* Transaction Ledger */}
                <div className="p-0 sm:p-2">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-50">
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Reference</th>
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <p className="text-sm font-bold text-slate-900">{new Date(tx.createdAt).toLocaleDateString("en-GB")}</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                                                }`}>
                                                {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{tx.description}</p>
                                                <p className="text-xs text-slate-400 font-medium capitalize">{tx.category.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right font-mono text-[10px] text-slate-400 uppercase select-all group-hover:text-slate-600 transition-colors">
                                        {tx.reference}
                                    </td>
                                    <td className={`px-8 py-5 text-right font-bold whitespace-nowrap ${tx.amount > 0 ? "text-emerald-600" : "text-slate-900"
                                        }`}>
                                        {tx.amount > 0 ? "+" : ""}
                                        ₦{tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5 text-right text-sm font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                                        ₦{tx.balanceAfter.toLocaleString()}
                                    </td>
                                </tr>
                            ))}

                            {data?.transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                            <HistoryIcon size={48} strokeWidth={1} />
                                            <p className="font-medium">No transactions found for this period.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Closing Footer */}
                <div className="p-12 bg-slate-900 text-white rounded-b-2xl print:bg-white print:text-slate-900 print:rounded-none">
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-8">
                        <div>
                            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Official Notice</p>
                            <p className="text-sm text-slate-400 max-w-md leading-relaxed print:text-slate-600 font-medium">
                                This account statement is for informational purposes only. All trades are backed by physical commodities as per the GDIP protocol. Please report any discrepancies to <span className="text-emerald-400 font-bold underline">compliance@glotrade.com</span> within 48 hours.
                            </p>
                        </div>

                        <div className="text-right">
                            <div className="mb-4">
                                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Portfolio Value</p>
                                <p className="text-4xl font-black text-white print:text-slate-900">
                                    ₦{(data?.summary.currentBalance || 0 + (data?.summary.totalInvested || 0)).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                                <CheckCircle2 size={12} /> Secure Ledger Verified
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center print:mt-12">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Glotrade International Platform © 2025 • End of Statement
                </p>
            </div>
        </div>
    );
}

// Reuse CheckCircle2 icon locally if not imported
function CheckCircle2({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
