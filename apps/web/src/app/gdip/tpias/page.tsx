"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import { ArrowLeft, Inbox, Search, Filter } from "lucide-react";

interface TPIA {
    _id: string;
    tpiaId: string;
    tpiaNumber: number;
    partnerName: string;
    gdcNumber: number;
    positionInGDC: number;
    purchasePrice: number;
    currentValue: number;
    totalProfitEarned: number;
    profitMode: "TPM" | "EPS";
    status: string;
    cyclesCompleted: number;
    insuranceCertificateNumber: string;
    commodityType: string;
    purchasedAt: string;
    currentCycleId?: {
        startDate: string;
        endDate: string;
        status: string;
        targetProfitRate: number;
    };
}

export default function AllTPIAsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tpias, setTPIAs] = useState<TPIA[]>([]);
    const [filteredTPIAs, setFilteredTPIAs] = useState<TPIA[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [modeFilter, setModeFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchTPIAs();
    }, []);

    useEffect(() => {
        filterTPIAs();
    }, [statusFilter, modeFilter, searchQuery, tpias]);

    const fetchTPIAs = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; count: number; data: TPIA[] }>("/api/v1/gdip/tpias");

            if (response.success) {
                setTPIAs(response.data);
                setFilteredTPIAs(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching TPIAs:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterTPIAs = () => {
        let filtered = [...tpias];

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((tpia) => tpia.status === statusFilter);
        }

        // Mode filter
        if (modeFilter !== "all") {
            filtered = filtered.filter((tpia) => tpia.profitMode === modeFilter);
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (tpia) =>
                    tpia.tpiaId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tpia.commodityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tpia.insuranceCertificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredTPIAs(filtered);
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">All TPIAs</h1>
                    <p className="text-gray-600">Manage and track all your investment blocks</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by TPIA ID, commodity, or certificate..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="matured">Matured</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        {/* Mode Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profit Mode</label>
                            <select
                                value={modeFilter}
                                onChange={(e) => setModeFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Modes</option>
                                <option value="TPM">TPM (Compounding)</option>
                                <option value="EPS">EPS (Withdrawal)</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredTPIAs.length} of {tpias.length} TPIAs
                    </div>
                </div>

                {/* TPIAs Grid */}
                {filteredTPIAs.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No TPIAs Found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your filters or purchase a new TPIA</p>
                        <button
                            onClick={() => router.push("/gdip/purchase")}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Purchase TPIA
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTPIAs.map((tpia) => (
                            <div
                                key={tpia._id}
                                onClick={() => router.push(`/gdip/tpia/${tpia._id}`)}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-blue-300"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-xl text-gray-900">{tpia.tpiaId}</h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${tpia.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : tpia.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : tpia.status === "matured"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {tpia.status}
                                    </span>
                                </div>

                                {/* Commodity Badge */}
                                <div className="mb-4">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                                        <span>🌾</span>
                                        {tpia.commodityType}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">GDC:</span>
                                        <span className="font-medium">GDC-{tpia.gdcNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Position:</span>
                                        <span className="font-medium">{tpia.positionInGDC}/10</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Invested:</span>
                                        <span className="font-medium">{formatCurrency(tpia.purchasePrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current Value:</span>
                                        <span className="font-medium text-green-600">{formatCurrency(tpia.currentValue)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Profit:</span>
                                        <span className="font-medium text-green-600">+{formatCurrency(tpia.totalProfitEarned)}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${tpia.profitMode === "TPM" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                                }`}
                                        >
                                            {tpia.profitMode}
                                        </span>
                                        <span className="text-xs text-gray-500">{tpia.cyclesCompleted} cycles</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(tpia.purchasedAt)}</span>
                                </div>

                                {tpia.status === "active" && tpia.currentCycleId && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Allocation Progress</span>
                                            <span className="text-xs font-bold text-blue-600">
                                                {(() => {
                                                    const start = new Date(tpia.currentCycleId.startDate).getTime();
                                                    const end = new Date(tpia.currentCycleId.endDate).getTime();
                                                    const now = Date.now();
                                                    const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                                                    return progress.toFixed(0);
                                                })()}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
                                                style={{
                                                    width: `${(() => {
                                                        const start = new Date(tpia.currentCycleId.startDate).getTime();
                                                        const end = new Date(tpia.currentCycleId.endDate).getTime();
                                                        const now = Date.now();
                                                        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                                                    })()}%`
                                                }}
                                            ></div>
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
