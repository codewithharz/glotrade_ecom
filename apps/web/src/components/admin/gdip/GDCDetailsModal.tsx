"use client";

import { useEffect, useState } from "react";
import { X, Target, Users, Activity, TrendingUp, Package, Calendar } from "lucide-react";
import { apiGet } from "@/utils/api";

interface GDCDetailsModalProps {
    gdcId: string;
    onClose: () => void;
}

interface GDCDetails {
    gdc: {
        _id: string;
        gdcId: string;
        gdcNumber: number;
        status: string;
        capacity: number;
        currentFill: number;
        totalCapital: number;
        primaryCommodity: string;
        createdAt: string;
    };
    tpias: Array<{
        _id: string;
        tpiaId: string;
        partnerName: string;
        purchasePrice: number;
        status: string;
    }>;
    recentCycles: Array<{
        _id: string;
        cycleId: string;
        startDate: string;
        endDate: string;
        status: string;
        actualProfitRate: number;
    }>;
}

export default function GDCDetailsModal({ gdcId, onClose }: GDCDetailsModalProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<GDCDetails | null>(null);

    useEffect(() => {
        if (gdcId) {
            fetchDetails();
        }
    }, [gdcId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: GDCDetails }>(
                `/api/v1/gdip/gdc/${gdcId}`
            );
            if (response.success) {
                setData(response.data);
            }
        } catch (err) {
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
            month: "short",
            day: "numeric",
        });
    };

    if (!gdcId) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Target className="w-6 h-6 text-purple-600" />
                        GDC Cluster Details
                        {data && <span className="text-gray-500 font-normal">#{data.gdc.gdcNumber}</span>}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : data ? (
                    <div className="p-6 space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <p className="text-sm text-purple-700 font-medium mb-1">Status</p>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${data.gdc.status === "active" ? "bg-green-100 text-green-700" :
                                            data.gdc.status === "ready" ? "bg-blue-100 text-blue-700" :
                                                "bg-yellow-100 text-yellow-700"
                                        }`}>
                                        {data.gdc.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-700 font-medium mb-1">Capital Pool</p>
                                <p className="text-xl font-bold text-blue-900">{formatCurrency(data.gdc.totalCapital)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Fill Level</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold text-gray-900">{data.gdc.currentFill}/{data.gdc.capacity}</p>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[60px]">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${(data.gdc.currentFill / data.gdc.capacity) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                <p className="text-sm text-yellow-700 font-medium mb-1">Commodity</p>
                                <p className="text-xl font-bold text-yellow-900 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    {data.gdc.primaryCommodity || "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Associated TPIAs */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Investors ({data.tpias.length})
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                                        {data.tpias.map((tpia) => (
                                            <div key={tpia._id} className="p-4 hover:bg-gray-50">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{tpia.partnerName}</p>
                                                        <p className="text-xs text-gray-500">{tpia.tpiaId}</p>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{formatCurrency(tpia.purchasePrice)}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${tpia.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                        }`}>
                                                        {tpia.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {data.tpias.length === 0 && (
                                            <div className="p-8 text-center text-gray-500 text-sm">No investors yet</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Trade Cycles History */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Trade Cycles ({data.recentCycles.length})
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                                        {data.recentCycles.map((cycle) => (
                                            <div key={cycle._id} className="p-4 hover:bg-gray-50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-gray-900">Cycle #{cycle.cycleId}</span>
                                                    </div>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${cycle.status === "completed" ? "bg-blue-100 text-blue-700" :
                                                            cycle.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                        {cycle.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>{formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}</span>
                                                    {cycle.actualProfitRate > 0 && (
                                                        <span className="font-bold text-green-600 flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" />
                                                            {cycle.actualProfitRate}% ROI
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {data.recentCycles.length === 0 && (
                                            <div className="p-8 text-center text-gray-500 text-sm">No trade cycles yet</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        Failed to load details
                    </div>
                )}
            </div>
        </div>
    );
}
