"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/utils/api";

interface TradeCycle {
    _id: string;
    cycleId: string;
    cycleNumber: number;
    gdcNumber: number;
    tpiaCount: number;
    startDate: string;
    endDate: string;
    status: string;
    totalCapital: number;
    targetProfitRate: number;
    actualProfitRate: number;
    totalProfitGenerated: number;
    profitDistributed: boolean;
    performanceRating?: string;
}

export default function AdminCyclesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState<TradeCycle[]>([]);
    const [filteredCycles, setFilteredCycles] = useState<TradeCycle[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [processingCycle, setProcessingCycle] = useState<string | null>(null);

    useEffect(() => {
        fetchCycles();
    }, []);

    useEffect(() => {
        filterCycles();
    }, [statusFilter, cycles]);

    const fetchCycles = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: TradeCycle[] }>("/api/v1/gdip/admin/cycles");

            if (response.success) {
                setCycles(response.data);
                setFilteredCycles(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching cycles:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterCycles = () => {
        if (statusFilter === "all") {
            setFilteredCycles(cycles);
        } else {
            setFilteredCycles(cycles.filter((cycle) => cycle.status === statusFilter));
        }
    };

    const handleCompleteCycle = async (cycleId: string) => {
        const salePrice = prompt("Enter sale price (₦):");
        if (!salePrice) return;

        const tradingCosts = prompt("Enter trading costs (₦, optional):");

        try {
            setProcessingCycle(cycleId);
            await apiPost(
                `/api/v1/gdip/admin/cycle/${cycleId}/complete`,
                {
                    salePrice: parseFloat(salePrice),
                    tradingCosts: tradingCosts ? parseFloat(tradingCosts) : 0,
                }
            );

            alert("Cycle completed successfully!");
            fetchCycles();
        } catch (err: any) {
            console.error("Error completing cycle:", err);
            alert(err.message || "Failed to complete cycle");
        } finally {
            setProcessingCycle(null);
        }
    };

    const handleDistributeProfits = async (cycleId: string) => {
        if (!confirm("Are you sure you want to distribute profits for this cycle?")) return;

        try {
            setProcessingCycle(cycleId);
            await apiPost(
                `/api/v1/gdip/admin/cycle/${cycleId}/distribute`
            );

            alert("Profits distributed successfully!");
            fetchCycles();
        } catch (err: any) {
            console.error("Error distributing profits:", err);
            alert(err.message || "Failed to distribute profits");
        } finally {
            setProcessingCycle(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";
            case "completed":
                return "bg-blue-100 text-blue-700";
            case "scheduled":
                return "bg-yellow-100 text-yellow-700";
            case "processing":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Trade Cycle Management</h1>
                            <p className="text-gray-600">Monitor and control all 37-day trade cycles</p>
                        </div>
                        <button
                            onClick={() => router.push("/admin/gdip/cycles/create")}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                        >
                            + Create Cycle
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {cycles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Total</p>
                            <p className="text-3xl font-bold text-gray-900">{cycles.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {cycles.filter((c) => c.status === "scheduled").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Active</p>
                            <p className="text-3xl font-bold text-green-600">
                                {cycles.filter((c) => c.status === "active").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Processing</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {cycles.filter((c) => c.status === "processing").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Completed</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {cycles.filter((c) => c.status === "completed").length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Cycles</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="active">Active</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                        </select>
                        <span className="text-sm text-gray-600 ml-auto">
                            Showing {filteredCycles.length} of {cycles.length} cycles
                        </span>
                    </div>
                </div>

                {/* Cycles List */}
                <div className="space-y-4">
                    {filteredCycles.map((cycle) => (
                        <div key={cycle._id} className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-gray-900">{cycle.cycleId}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                                            {cycle.status.toUpperCase()}
                                        </span>
                                        {cycle.performanceRating && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                {cycle.performanceRating.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        GDC-{cycle.gdcNumber} • {cycle.tpiaCount} TPIAs
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {cycle.status === "active" && (
                                        <button
                                            onClick={() => handleCompleteCycle(cycle._id)}
                                            disabled={processingCycle === cycle._id}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                        >
                                            Complete Cycle
                                        </button>
                                    )}
                                    {cycle.status === "processing" && !cycle.profitDistributed && (
                                        <button
                                            onClick={() => handleDistributeProfits(cycle._id)}
                                            disabled={processingCycle === cycle._id}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                        >
                                            Distribute Profits
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 mb-1">Period</p>
                                    <p className="font-medium">
                                        {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 mb-1">Total Capital</p>
                                    <p className="font-medium">{formatCurrency(cycle.totalCapital)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 mb-1">Target ROI</p>
                                    <p className="font-medium">{cycle.targetProfitRate}%</p>
                                </div>
                                {cycle.status === "completed" && (
                                    <>
                                        <div>
                                            <p className="text-gray-600 mb-1">Actual ROI</p>
                                            <p className="font-medium text-green-600">{cycle.actualProfitRate.toFixed(2)}%</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-gray-600 mb-1">Total Profit</p>
                                            <p className="font-medium text-green-600">{formatCurrency(cycle.totalProfitGenerated)}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-gray-600 mb-1">Profit Status</p>
                                            <p className={`font-medium ${cycle.profitDistributed ? "text-green-600" : "text-yellow-600"}`}>
                                                {cycle.profitDistributed ? "✓ Distributed" : "⏳ Pending Distribution"}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
