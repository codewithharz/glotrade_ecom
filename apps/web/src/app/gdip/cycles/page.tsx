"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import { ArrowLeft, ClipboardCheck, CheckCircle2, Clock } from "lucide-react";

interface TradeCycle {
    _id: string;
    cycleId: string;
    cycleNumber: number;
    gdcId: string;
    gdcNumber: number;
    tpiaCount: number;
    startDate: string;
    endDate: string;
    duration: number;
    actualDuration?: number;
    status: string;
    totalCapital: number;
    targetProfitRate: number;
    actualProfitRate: number;
    totalProfitGenerated: number;
    commodityType: string;
    purchasePrice: number;
    salePrice?: number;
    roi: number;
    performanceRating?: string;
    profitDistributed: boolean;
    distributionDate?: string;
}

export default function TradeCyclesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState<TradeCycle[]>([]);
    const [filteredCycles, setFilteredCycles] = useState<TradeCycle[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        fetchCycles();
    }, []);

    useEffect(() => {
        filterCycles();
    }, [statusFilter, cycles]);

    const fetchCycles = async () => {
        try {
            setLoading(true);
            // Get all TPIAs first
            const tpiasResponse = await apiGet<{ success: boolean; count: number; data: any[] }>(
                "/api/v1/gdip/tpias"
            );

            if (tpiasResponse.success && tpiasResponse.data.length > 0) {
                // Get cycles for first TPIA (they all share same GDC cycles)
                const firstTPIA = tpiasResponse.data[0];
                const cyclesResponse = await apiGet<{ success: boolean; count: number; data: TradeCycle[] }>(
                    `/api/v1/gdip/tpia/${firstTPIA._id}/cycles`,
                    { query: { limit: 50 } }
                );

                if (cyclesResponse.success) {
                    setCycles(cyclesResponse.data);
                    setFilteredCycles(cyclesResponse.data);
                }
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

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
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

    const getPerformanceColor = (rating?: string) => {
        switch (rating) {
            case "excellent":
                return "text-green-600";
            case "good":
                return "text-blue-600";
            case "average":
                return "text-yellow-600";
            case "poor":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Trade Cycles</h1>
                    <p className="text-gray-600">37-day commodity trading cycle history and performance</p>
                </div>

                {/* Stats Summary */}
                {cycles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Cycles</p>
                            <p className="text-3xl font-bold text-gray-900">{cycles.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Completed</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {cycles.filter((c) => c.status === "completed").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Active</p>
                            <p className="text-3xl font-bold text-green-600">
                                {cycles.filter((c) => c.status === "active").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Avg ROI</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {(
                                    cycles
                                        .filter((c) => c.status === "completed")
                                        .reduce((sum, c) => sum + c.roi, 0) /
                                    cycles.filter((c) => c.status === "completed").length || 0
                                ).toFixed(2)}
                                %
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

                {/* Cycles Timeline */}
                {filteredCycles.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Cycles Found</h3>
                        <p className="text-gray-600">No trade cycles match your filter criteria</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCycles.map((cycle, index) => (
                            <div key={cycle._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-bold text-gray-900">{cycle.cycleId}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                                                {cycle.status.toUpperCase()}
                                            </span>
                                            {cycle.performanceRating && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${getPerformanceColor(cycle.performanceRating)}`}>
                                                    {cycle.performanceRating.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            GDC-{cycle.gdcNumber} • {cycle.tpiaCount} TPIAs • {cycle.commodityType}
                                        </p>
                                    </div>
                                    {cycle.status === "active" && (
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Days Remaining</p>
                                            <p className="text-2xl font-bold text-green-600">{getDaysRemaining(cycle.endDate)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Timeline */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex-1">
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${cycle.status === "completed"
                                                        ? "bg-blue-600"
                                                        : cycle.status === "active"
                                                            ? "bg-green-600"
                                                            : "bg-yellow-600"
                                                        }`}
                                                    style={{
                                                        width:
                                                            cycle.status === "completed"
                                                                ? "100%"
                                                                : cycle.status === "active"
                                                                    ? `${((37 - getDaysRemaining(cycle.endDate)) / 37) * 100}%`
                                                                    : "0%",
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>{formatDate(cycle.startDate)}</span>
                                        <span>{cycle.duration} days</span>
                                        <span>{formatDate(cycle.endDate)}</span>
                                    </div>
                                </div>

                                {/* Financial Details */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Total Capital</p>
                                        <p className="font-bold text-gray-900">{formatCurrency(cycle.totalCapital)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Target ROI</p>
                                        <p className="font-bold text-gray-900">{cycle.targetProfitRate}%</p>
                                    </div>
                                    {cycle.status === "completed" && (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Actual ROI</p>
                                                <p className="font-bold text-green-600">{cycle.actualProfitRate.toFixed(2)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Total Profit</p>
                                                <p className="font-bold text-green-600">{formatCurrency(cycle.totalProfitGenerated)}</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Distribution Status */}
                                {cycle.status === "completed" && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Profit Distribution:</span>
                                            {cycle.profitDistributed ? (
                                                <span className="flex items-center gap-2 text-sm text-green-600">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Distributed on {cycle.distributionDate && formatDate(cycle.distributionDate)}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-sm text-yellow-600">
                                                    <Clock className="w-4 h-4" />
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
