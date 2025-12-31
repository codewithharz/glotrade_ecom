"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { translate } from "@/utils/translate";

interface CommodityBacking {
    _id: string;
    commodityId: string;
    commodityType: string;
    quantity: number;
    unit: string;
    currentMarketPrice: number;
    pricePerUnit: number;
    warehouseLocation: string;
    quality: string;
    condition: string;
    lastPriceUpdate: string;
}

interface CommoditySummary {
    totalCommodities: number;
    totalValue: number;
    totalQuantity: number;
    types: string[];
}

export default function CommodityBackingPage() {
    const params = useParams();
    const router = useRouter();
    const tpiaId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [commodities, setCommodities] = useState<CommodityBacking[]>([]);
    const [summary, setSummary] = useState<CommoditySummary | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (tpiaId) {
            fetchCommodityBacking();
        }
    }, [tpiaId]);

    const fetchCommodityBacking = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/commodity/backing/${tpiaId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.data.success) {
                setCommodities(response.data.data.commodities);
                setSummary(response.data.data.summary);
            }
        } catch (err: any) {
            console.error("Error fetching commodity backing:", err);
            setError(err.response?.data?.error || translate("gdip.commodity.error.loadFailed"));
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
            year: "numeric",
            month: "long",
            day: "numeric",
        });
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
                    <h2 className="text-2xl font-bold text-red-600 mb-4">{translate("gdip.commodity.error.title")}</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        {translate("gdip.commodity.error.goBack")}
                    </button>
                </div>
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {translate("gdip.commodity.back")}
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{translate("gdip.commodity.title")}</h1>
                    <p className="text-gray-600">{translate("gdip.commodity.subtitle")}</p>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">{translate("gdip.commodity.summary.total")}</p>
                            <p className="text-3xl font-bold text-gray-900">{summary.totalCommodities}</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">{translate("gdip.commodity.summary.value")}</p>
                            <p className="text-3xl font-bold text-green-600">{formatCurrency(summary.totalValue)}</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">{translate("gdip.commodity.summary.quantity")}</p>
                            <p className="text-3xl font-bold text-blue-600">{summary.totalQuantity}</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">{translate("gdip.commodity.summary.types")}</p>
                            <p className="text-3xl font-bold text-purple-600">{summary.types.length}</p>
                        </div>
                    </div>
                )}

                {/* Commodities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commodities.map((commodity) => (
                        <div key={commodity._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">{commodity.commodityType}</h3>
                                <span className="text-2xl">🌾</span>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{translate("gdip.commodity.card.idLabel")}:</span>
                                    <span className="font-medium font-mono text-xs">{commodity.commodityId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{translate("gdip.commodity.card.quantityLabel")}:</span>
                                    <span className="font-medium">
                                        {commodity.quantity} {commodity.unit}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{translate("gdip.commodity.card.marketPriceLabel")}:</span>
                                    <span className="font-medium text-green-600">{formatCurrency(commodity.currentMarketPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{translate("gdip.commodity.card.unitPriceLabel")}:</span>
                                    <span className="font-medium">{formatCurrency(commodity.pricePerUnit)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{translate("gdip.commodity.card.qualityLabel")}:</span>
                                    <span className="font-medium capitalize">{commodity.quality}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{translate("gdip.commodity.card.conditionLabel")}:</span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${commodity.condition === "excellent"
                                            ? "bg-green-100 text-green-700"
                                            : commodity.condition === "good"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {translate("gdip.commodity.conditions." + commodity.condition)}
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-xs text-gray-500 mb-2">
                                    <strong>{translate("gdip.commodity.card.warehouseLabel")}:</strong> {commodity.warehouseLocation}
                                </div>
                                <div className="text-xs text-gray-500">
                                    <strong>{translate("gdip.commodity.card.updatedLabel")}:</strong> {formatDate(commodity.lastPriceUpdate)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {commodities.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{translate("gdip.commodity.empty.title")}</h3>
                        <p className="text-gray-600">{translate("gdip.commodity.empty.subtitle")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
