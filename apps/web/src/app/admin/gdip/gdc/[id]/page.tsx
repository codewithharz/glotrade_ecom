"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/utils/api";

interface TPIA {
    _id: string;
    tpiaId: string;
    partnerName: string;
    currentValue: number;
    profitMode: string;
    status: string;
    purchasedAt: string;
}

interface TradeCycle {
    _id: string;
    cycleId: string;
    cycleNumber: number;
    status: string;
    startDate: string;
    endDate: string;
    actualProfitRate?: number;
    totalProfitGenerated?: number;
}

interface GDCDetails {
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
    tpias: TPIA[];
    activeCycle?: TradeCycle;
    cycleHistory?: TradeCycle[];
}

export default function GDCDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [gdc, setGdc] = useState<GDCDetails | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchGDCDetails(params.id as string);
        }
    }, [params.id]);

    const fetchGDCDetails = async (id: string) => {
        try {
            setLoading(true);
            // The API returns { gdc: {...}, tpias: [...], recentCycles: [...] }
            const response = await apiGet<{ success: boolean; data: any }>(`/api/v1/gdip/gdc/${id}`);

            if (response.success) {
                // Flatten the response for easier consumption
                const rawGdc = response.data.gdc;
                const flattenedGdc: GDCDetails = {
                    ...rawGdc,
                    tpias: response.data.tpias || [],
                    cycleHistory: response.data.recentCycles || []
                };
                setGdc(flattenedGdc);
            }
        } catch (err: any) {
            console.error("Error fetching GDC details:", err);
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

    const getFillPercentage = (current: number, capacity: number) => {
        return (current / capacity) * 100;
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

    if (!gdc) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">GDC Not Found</h2>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Go Back
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to GDCs
                        </button>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">{gdc.gdcId}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(gdc.status)}`}>
                                {gdc.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Capacity Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Cluster Capacity</h3>
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Fill Status</span>
                                <span className="font-medium">{gdc.currentFill}/{gdc.capacity} Slots</span>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${gdc.isFull ? "bg-green-600" : "bg-blue-600"}`}
                                    style={{ width: `${getFillPercentage(gdc.currentFill, gdc.capacity)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total Capital</span>
                            <span className="text-xl font-bold text-gray-900">{formatCurrency(gdc.totalCapital)}</span>
                        </div>
                    </div>

                    {/* Performance Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Cycles Completed</span>
                                <span className="font-medium">{gdc.cyclesCompleted}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Profit Generated</span>
                                <span className="font-medium text-green-600">{formatCurrency(gdc.totalProfitGenerated)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Average ROI</span>
                                <span className="font-medium text-purple-600">{gdc.averageROI.toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Primary Commodity</span>
                                <span className="font-medium flex items-center gap-2">
                                    <span>🌾</span> {gdc.primaryCommodity}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Formation Date</span>
                                <span className="font-medium">{formatDate(gdc.formedAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Next Cycle</span>
                                <span className="font-medium">
                                    {gdc.activeCycle ? "In Progress" : "Scheduled"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TPIAs List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Included TPIAs ({gdc.tpias?.length || 0})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TPIA ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Mode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {gdc.tpias?.map((tpia) => (
                                    <tr key={tpia._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{tpia.tpiaId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{tpia.partnerName || "Unknown"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(tpia.currentValue)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${tpia.profitMode === "TPM" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {tpia.profitMode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${tpia.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {tpia.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(tpia.purchasedAt)}</td>
                                    </tr>
                                ))}
                                {(!gdc.tpias || gdc.tpias.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No TPIAs in this cluster yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
