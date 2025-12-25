"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/utils/api";

interface GDC {
    _id: string;
    gdcId: string;
    gdcNumber: number;
    capacity: number;
    currentFill: number;
    isFull: boolean;
    status: string;
    totalCapital: number;
    cyclesCompleted: number;
    totalProfitGenerated: number;
    averageROI: number;
    primaryCommodity: string;
    formedAt?: string;
    nextCycleStartDate?: string;
}

export default function AdminGDCsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [gdcs, setGDCs] = useState<GDC[]>([]);
    const [filteredGDCs, setFilteredGDCs] = useState<GDC[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        fetchGDCs();
    }, []);

    useEffect(() => {
        filterGDCs();
    }, [statusFilter, gdcs]);

    const fetchGDCs = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: GDC[] }>("/api/v1/gdip/admin/gdcs");

            if (response.success) {
                setGDCs(response.data);
                setFilteredGDCs(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching GDCs:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterGDCs = () => {
        if (statusFilter === "all") {
            setFilteredGDCs(gdcs);
        } else {
            setFilteredGDCs(gdcs.filter((gdc) => gdc.status === statusFilter));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
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
            case "ready":
                return "bg-blue-100 text-blue-700";
            case "forming":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getFillPercentage = (gdc: GDC) => {
        return (gdc.currentFill / gdc.capacity) * 100;
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">GDC Management</h1>
                    <p className="text-gray-600">Monitor and manage Global Digital Clusters</p>
                </div>

                {/* Stats Summary */}
                {gdcs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Total GDCs</p>
                            <p className="text-3xl font-bold text-gray-900">{gdcs.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Active GDCs</p>
                            <p className="text-3xl font-bold text-green-600">
                                {gdcs.filter((g) => g.status === "active").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Full GDCs</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {gdcs.filter((g) => g.isFull).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Avg ROI</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {(
                                    gdcs.reduce((sum, g) => sum + g.averageROI, 0) / gdcs.length || 0
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
                            <option value="all">All GDCs</option>
                            <option value="forming">Forming</option>
                            <option value="ready">Ready</option>
                            <option value="active">Active</option>
                        </select>
                        <span className="text-sm text-gray-600 ml-auto">
                            Showing {filteredGDCs.length} of {gdcs.length} GDCs
                        </span>
                    </div>
                </div>

                {/* GDCs Grid */}
                {filteredGDCs.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No GDCs Found</h3>
                        <p className="text-gray-600">No GDCs match your filter criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGDCs.map((gdc) => (
                            <div
                                key={gdc._id}
                                onClick={() => router.push(`/admin/gdip/gdc/${gdc._id}`)}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-blue-300"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold text-gray-900">{gdc.gdcId}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(gdc.status)}`}>
                                        {gdc.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Fill Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Capacity</span>
                                        <span className="font-medium">
                                            {gdc.currentFill}/{gdc.capacity}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${gdc.isFull ? "bg-green-600" : "bg-blue-600"
                                                }`}
                                            style={{ width: `${getFillPercentage(gdc)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Commodity Badge */}
                                <div className="mb-4">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                                        <span>🌾</span>
                                        {gdc.primaryCommodity}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="space-y-3 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Capital:</span>
                                        <span className="font-medium">{formatCurrency(gdc.totalCapital)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cycles Completed:</span>
                                        <span className="font-medium">{gdc.cyclesCompleted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Profit:</span>
                                        <span className="font-medium text-green-600">{formatCurrency(gdc.totalProfitGenerated)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Average ROI:</span>
                                        <span className="font-medium text-purple-600">{gdc.averageROI.toFixed(2)}%</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pt-4 border-t border-gray-100">
                                    {gdc.formedAt && (
                                        <div className="text-xs text-gray-500">
                                            Formed: {formatDate(gdc.formedAt)}
                                        </div>
                                    )}
                                    {gdc.nextCycleStartDate && (
                                        <div className="text-xs text-gray-500">
                                            Next Cycle: {formatDate(gdc.nextCycleStartDate)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
