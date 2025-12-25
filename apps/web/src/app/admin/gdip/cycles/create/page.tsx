"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle, Package, Calendar, DollarSign, Target, Activity } from "lucide-react";
import { apiGet, apiPost } from "@/utils/api";

interface GDC {
    _id: string;
    gdcNumber: number;
    status: string;
    capacity: number;
    currentFill: number;
    primaryCommodity?: string;
}

export default function CreateCyclePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingGDCs, setLoadingGDCs] = useState(true);
    const [gdcs, setGDCs] = useState<GDC[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        gdcId: "",
        commodityType: "",
        commodityQuantity: 100,
        purchasePrice: 0,
        startDate: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchGDCs();
    }, []);

    const fetchGDCs = async () => {
        try {
            setLoadingGDCs(true);
            const response = await apiGet<{ success: boolean; data: GDC[] }>("/api/v1/gdip/admin/gdcs");
            if (response.success && Array.isArray(response.data)) {
                setGDCs(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch GDCs:", err);
            setError("Failed to load GDC clusters. Please check your connection.");
        } finally {
            setLoadingGDCs(false);
        }
    };

    const handleGDCSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedGDC = gdcs.find(g => g._id === selectedId);

        setFormData(prev => ({
            ...prev,
            gdcId: selectedId,
            // Auto-fill commodity type if the GDC already has a primary commodity preference
            commodityType: selectedGDC?.primaryCommodity || prev.commodityType
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.gdcId || !formData.commodityType || !formData.purchasePrice) {
            setError("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await apiPost<{ success: boolean }>(
                "/api/v1/gdip/admin/cycle/create",
                formData
            );

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/admin/gdip");
                }, 2000);
            }
        } catch (err: any) {
            console.error("Error creating cycle:", err);
            setError(err.message || "Failed to create trade cycle");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Trade Cycle Created!</h2>
                    <p className="text-gray-600 mb-6">The 37-day cycle has been scheduled successfully.</p>
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Trade Cycle</h1>
                    <p className="text-gray-600">Schedule a new 37-day commodity trading cycle for a GDC cluster</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top-2">
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* GDC Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4 text-gray-500" />
                                Target GDC Cluster *
                            </label>
                            {loadingGDCs ? (
                                <div className="animate-pulse h-12 bg-gray-100 rounded-lg"></div>
                            ) : (
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.gdcId}
                                        onChange={handleGDCSelect}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                                    >
                                        <option value="">Select a GDC Cluster</option>
                                        {gdcs.map((gdc) => (
                                            <option key={gdc._id} value={gdc._id}>
                                                GDC-{gdc.gdcNumber} • {gdc.status.toUpperCase()} • {gdc.currentFill}/{gdc.capacity} Slots
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                                        </svg>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Select the GDC where this trade cycle will operate</p>
                        </div>

                        {/* Commodity Type - Manual Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                Commodity Type *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.commodityType}
                                onChange={(e) => setFormData({ ...formData, commodityType: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter commodity name (e.g. Premium Rice, Sugar, Wheat)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Specify the exact commodity being traded in this cycle</p>
                        </div>

                        {/* Grid for Quantity and Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Units) *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.commodityQuantity}
                                    onChange={(e) => setFormData({ ...formData, commodityQuantity: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                    Total Purchase Cost (₦) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.purchasePrice}
                                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                Start Date (Optional)
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty to start the cycle immediately</p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Cycle Parameters
                            </h4>
                            <ul className="text-sm text-blue-800 space-y-2 ml-1">
                                <li className="flex items-center gap-2">• <span className="font-medium">Duration:</span> 37 days from start date</li>
                                <li className="flex items-center gap-2">• <span className="font-medium">Target:</span> ~5% ROI per cycle</li>
                                <li className="flex items-center gap-2">• <span className="font-medium">Automation:</span> Auto-completion & profit distribution enabled</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Initializing Cycle...
                                </>
                            ) : (
                                "Create Trade Cycle"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
