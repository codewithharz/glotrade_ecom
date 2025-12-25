"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPut } from "@/utils/api";

interface TPIADetails {
    tpia: {
        _id: string;
        tpiaId: string;
        tpiaNumber: number;
        partnerName: string;
        partnerEmail: string;
        gdcId: string;
        gdcNumber: number;
        positionInGDC: number;
        purchasePrice: number;
        currentValue: number;
        totalProfitEarned: number;
        compoundedValue: number;
        profitMode: "TPM" | "EPS";
        status: string;
        cyclesCompleted: number;
        insuranceCertificateNumber: string;
        insuranceStatus: string;
        commodityType: string;
        commodityQuantity: number;
        commodityUnit: string;
        purchasedAt: string;
        activatedAt?: string;
    };
    gdc: {
        gdcId: string;
        gdcNumber: number;
        currentFill: number;
        capacity: number;
        status: string;
        cyclesCompleted: number;
        totalProfitGenerated: number;
        averageROI: number;
    };
    insurance: {
        certificateNumber: string;
        provider: string;
        coverageAmount: number;
        status: string;
        effectiveDate: string;
        expiryDate: string;
    };
    currentCycle?: {
        cycleId: string;
        cycleNumber: number;
        startDate: string;
        endDate: string;
        status: string;
        targetProfitRate: number;
    };
}

export default function TPIADetailsPage() {
    const router = useRouter();
    const params = useParams();
    const tpiaId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<TPIADetails | null>(null);
    const [switchingMode, setSwitchingMode] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (tpiaId) {
            fetchDetails();
        }
    }, [tpiaId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: TPIADetails }>(
                `/api/v1/gdip/tpia/${tpiaId}`
            );

            if (response.success) {
                setDetails(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching TPIA details:", err);
            setError(err.message || "Failed to load TPIA details");
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchProfitMode = async () => {
        if (!details) return;

        const newMode = details.tpia.profitMode === "TPM" ? "EPS" : "TPM";

        try {
            setSwitchingMode(true);
            const response = await apiPut<{ success: boolean; message: string; data: any }>(
                `/api/v1/gdip/tpia/${tpiaId}/profit-mode`,
                { profitMode: newMode }
            );

            if (response.success) {
                await fetchDetails(); // Refresh data
            }
        } catch (err: any) {
            console.error("Error switching profit mode:", err);
            alert(err.message || "Failed to switch profit mode");
        } finally {
            setSwitchingMode(false);
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

    const calculateROI = () => {
        if (!details) return 0;
        return ((details.tpia.totalProfitEarned / details.tpia.purchasePrice) * 100).toFixed(2);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error || "TPIA not found"}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { tpia, gdc, insurance, currentCycle } = details;

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
                        Back
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{tpia.tpiaId}</h1>
                            <p className="text-gray-600">Trade Partners Insured Alliance Block</p>
                        </div>
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-medium ${tpia.status === "active"
                                ? "bg-green-100 text-green-700"
                                : tpia.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {tpia.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Financial Overview */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Overview</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(tpia.purchasePrice)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Current Value</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(tpia.currentValue)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Profit Earned</p>
                                    <p className="text-2xl font-bold text-green-600">+{formatCurrency(tpia.totalProfitEarned)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">ROI</p>
                                    <p className="text-2xl font-bold text-purple-600">{calculateROI()}%</p>
                                </div>
                                {tpia.profitMode === "TPM" && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600 mb-1">Compounded Value</p>
                                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(tpia.compoundedValue)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* GDC Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">GDC Assignment</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">GDC Number:</span>
                                    <span className="font-bold text-lg">{gdc.gdcId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Position:</span>
                                    <span className="font-medium">{tpia.positionInGDC} of {gdc.capacity}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">GDC Status:</span>
                                    <span className="font-medium capitalize">{gdc.status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">GDC Fill:</span>
                                    <span className="font-medium">{gdc.currentFill}/{gdc.capacity}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">GDC Cycles Completed:</span>
                                    <span className="font-medium">{gdc.cyclesCompleted}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">GDC Average ROI:</span>
                                    <span className="font-medium text-green-600">{gdc.averageROI.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Cycle */}
                        {currentCycle && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Current Trade Cycle</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Cycle ID:</span>
                                        <span className="font-medium">{currentCycle.cycleId}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Cycle Number:</span>
                                        <span className="font-medium">#{currentCycle.cycleNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Start Date:</span>
                                        <span className="font-medium">{formatDate(currentCycle.startDate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">End Date:</span>
                                        <span className="font-medium">{formatDate(currentCycle.endDate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Target Profit:</span>
                                        <span className="font-medium text-green-600">{currentCycle.targetProfitRate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-medium capitalize">{currentCycle.status}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Commodity Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Commodity Backing</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Commodity Type:</span>
                                    <span className="font-medium flex items-center gap-2">
                                        <span>🌾</span>
                                        {tpia.commodityType}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Quantity Allocated:</span>
                                    <span className="font-medium">{tpia.commodityQuantity} {tpia.commodityUnit}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profit Mode Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Profit Mode</h3>
                            <div className="mb-4">
                                <div
                                    className={`p-4 rounded-xl border-2 ${tpia.profitMode === "TPM"
                                        ? "border-purple-600 bg-purple-50"
                                        : "border-blue-600 bg-blue-50"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-lg">{tpia.profitMode}</h4>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${tpia.profitMode === "TPM"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-blue-100 text-blue-700"
                                                }`}
                                        >
                                            {tpia.profitMode === "TPM" ? "Compounding" : "Withdrawal"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {tpia.profitMode === "TPM"
                                            ? "Profits reinvest automatically to increase your TPIA value"
                                            : "Profits are credited to your wallet for withdrawal"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSwitchProfitMode}
                                disabled={switchingMode}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                            >
                                {switchingMode ? "Switching..." : `Switch to ${tpia.profitMode === "TPM" ? "EPS" : "TPM"}`}
                            </button>
                        </div>

                        {/* Insurance Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Insurance</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-600 mb-1">Certificate Number</p>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">{insurance.certificateNumber}</p>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Provider:</span>
                                    <span className="font-medium">{insurance.provider}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Coverage:</span>
                                    <span className="font-medium">{formatCurrency(insurance.coverageAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${insurance.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {insurance.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Valid Until:</span>
                                    <span className="font-medium">{formatDate(insurance.expiryDate)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Statistics</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cycles Completed:</span>
                                    <span className="font-bold text-lg">{tpia.cyclesCompleted}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Purchased:</span>
                                    <span className="font-medium">{formatDate(tpia.purchasedAt)}</span>
                                </div>
                                {tpia.activatedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Activated:</span>
                                        <span className="font-medium">{formatDate(tpia.activatedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
