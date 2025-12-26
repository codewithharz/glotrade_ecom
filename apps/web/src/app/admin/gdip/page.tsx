"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, TrendingUp, Users, Target, Activity, Calendar } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/utils/api";
import TPIADetailsModal from "@/components/admin/gdip/TPIADetailsModal";
import GDCDetailsModal from "@/components/admin/gdip/GDCDetailsModal";
import CycleDetailsModal from "@/components/admin/gdip/CycleDetailsModal";

interface DashboardStats {
    totalTPIAs: number;
    totalGDCs: number;
    totalCycles: number;
    activeTPIAs: number;
    activeCycles: number;
    totalCapitalDeployed: number;
    totalProfitGenerated: number;
    averageROI: number;
}

interface GDC {
    _id: string;
    gdcId: string;
    gdcNumber: number;
    currentFill: number;
    capacity: number;
    isFull: boolean;
    status: string;
    totalCapital: number;
    cyclesCompleted: number;
    averageROI: number;
}

interface TradeCycle {
    _id: string;
    cycleId: string;
    cycleNumber: number;
    gdcNumber: number;
    status: string;
    startDate: string;
    endDate: string;
    totalCapital: number;
    actualProfitRate: number;
    profitDistributed: boolean;
}

export default function AdminGDIPDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [gdcs, setGDCs] = useState<GDC[]>([]);
    const [recentCycles, setRecentCycles] = useState<TradeCycle[]>([]);
    const [recentTPIAs, setRecentTPIAs] = useState<any[]>([]);
    const [selectedTPIAId, setSelectedTPIAId] = useState<string | null>(null);
    const [selectedGDCId, setSelectedGDCId] = useState<string | null>(null);
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel using apiGet
            const [gdcsRes, cyclesRes, tpiasRes] = await Promise.all([
                apiGet<{ success: boolean; data: GDC[] }>("/api/v1/gdip/admin/gdcs"),
                apiGet<{ success: boolean; data: TradeCycle[] }>("/api/v1/gdip/admin/cycles"),
                apiGet<{ success: boolean; data: any[] }>("/api/v1/gdip/admin/tpias")
            ]);

            const allGDCs = gdcsRes.data || [];
            const allCycles = cyclesRes.data || [];
            const tpias = tpiasRes.data || [];

            setGDCs(allGDCs.slice(0, 10));
            setRecentCycles(allCycles.slice(0, 10));

            // Sort TPIAs by date (newest first)
            const sortedTPIAs = [...tpias].sort((a, b) =>
                new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
            );
            setRecentTPIAs(sortedTPIAs.slice(0, 10));

            // Calculate stats
            const completedCycles = allCycles.filter((c: TradeCycle) => c.status === "completed");
            const avgROI =
                completedCycles.length > 0
                    ? completedCycles.reduce((sum: number, c: TradeCycle) => sum + c.actualProfitRate, 0) / completedCycles.length
                    : 0;

            setStats({
                totalTPIAs: tpias.length,
                totalGDCs: allGDCs.length,
                totalCycles: allCycles.length,
                activeTPIAs: tpias.filter((t: any) => t.status === "active").length,
                activeCycles: allCycles.filter((c: TradeCycle) => c.status === "active").length,
                totalCapitalDeployed: allGDCs.reduce((sum: number, g: GDC) => sum + g.totalCapital, 0),
                totalProfitGenerated: allCycles.reduce((sum: number, c: any) => {
                    if (c.status === "completed") {
                        return sum + ((c.actualProfitRate || 0) / 100) * c.totalCapital;
                    }
                    return sum + (c.currentProfit || 0);
                }, 0),
                averageROI: avgROI,
            });

        } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
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
            month: "short",
            day: "numeric",
        });
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
                <div className="mb-6">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-600" />
                        Insured Partners Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Monitor and manage TPIA portfolios, GDC clusters, and trade cycles
                    </p>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total TPIAs</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.totalTPIAs}</h3>
                                <p className="text-xs text-green-600 mt-1 font-medium">{stats.activeTPIAs} active investors</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total GDCs</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.totalGDCs}</h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Active clusters</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Target className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Trade Cycles</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.totalCycles}</h3>
                                <p className="text-xs text-green-600 mt-1 font-medium">{stats.activeCycles} running now</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Activity className="w-5 h-5 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Average ROI</p>
                                <h3 className="text-2xl font-bold text-green-600">{stats.averageROI.toFixed(2)}%</h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Per 37-day cycle</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start justify-between shadow-sm md:col-span-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Capital Deployed</p>
                                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCapitalDeployed)}</h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Assets under management</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start justify-between shadow-sm md:col-span-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Profit Generated</p>
                                <h3 className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalProfitGenerated)}</h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Distributed to partners</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => router.push("/admin/gdip/cycles/create")}
                        className="flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                    >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium">Create Trade Cycle</span>
                    </button>
                    <button
                        onClick={() => router.push("/admin/gdip/gdcs")}
                        className="flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                    >
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                            <Target className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="font-medium">Manage GDCs</span>
                    </button>
                    <button
                        onClick={() => router.push("/admin/gdip/tpias")}
                        className="flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                    >
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-medium">View All TPIAs</span>
                    </button>
                    <button
                        onClick={() => router.push("/admin/gdip/commodities")}
                        className="flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group md:col-span-3 lg:col-span-1"
                    >
                        <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                            <Shield className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="font-medium">Manage Commodities</span>
                    </button>
                </div>

                {/* Recent Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent TPIAs */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Recent TPIAs</h2>
                            <button
                                onClick={() => router.push("/admin/gdip/tpias")}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All →
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentTPIAs.slice(0, 5).map((tpia) => (
                                <div
                                    key={tpia._id}
                                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedTPIAId(tpia._id)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium text-gray-900">{tpia.tpiaId}</h3>
                                        <span className="text-xs text-gray-500">{formatDate(tpia.purchasedAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{tpia.partnerName}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{formatCurrency(tpia.purchasePrice)}</span>
                                            <span
                                                className={`w-2 h-2 rounded-full ${tpia.status === "active" ? "bg-green-500" : "bg-yellow-500"
                                                    }`}
                                            ></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* GDCs Overview */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Recent GDCs</h2>
                            <button
                                onClick={() => router.push("/admin/gdip/gdcs")}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All →
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {gdcs.slice(0, 5).map((gdc) => (
                                <div
                                    key={gdc._id}
                                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedGDCId(gdc._id)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-gray-900">GDC-{gdc.gdcNumber}</h3>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${gdc.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : gdc.status === "ready"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {gdc.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>Fill: {gdc.currentFill}/{gdc.capacity}</span>
                                        <span>{formatCurrency(gdc.totalCapital)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Cycles */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Recent Cycles</h2>
                            <button
                                onClick={() => router.push("/admin/gdip/cycles")}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All →
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentCycles.slice(0, 5).map((cycle) => (
                                <div
                                    key={cycle._id}
                                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedCycleId(cycle._id)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900">{cycle.cycleId}</span>
                                        </div>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cycle.status === "completed"
                                                ? "bg-blue-100 text-blue-700"
                                                : cycle.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {cycle.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}</span>
                                        {cycle.status === "completed" && (
                                            <span className="font-medium text-green-600">ROI: {cycle.actualProfitRate.toFixed(2)}%</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedTPIAId && (
                <TPIADetailsModal
                    tpiaId={selectedTPIAId}
                    onClose={() => setSelectedTPIAId(null)}
                />
            )}
            {selectedGDCId && (
                <GDCDetailsModal
                    gdcId={selectedGDCId}
                    onClose={() => setSelectedGDCId(null)}
                />
            )}
            {selectedCycleId && (
                <CycleDetailsModal
                    cycleId={selectedCycleId}
                    onClose={() => setSelectedCycleId(null)}
                />
            )}
        </AdminLayout>
    );
}
