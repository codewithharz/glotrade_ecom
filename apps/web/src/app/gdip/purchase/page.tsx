"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/utils/api";

// COMMODITY_OPTIONS will be fetched from API

export default function PurchaseTPIAPage() {
    const router = useRouter();
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedCommodity, setSelectedCommodity] = useState("");
    const [profitMode, setProfitMode] = useState<"TPM" | "EPS">("TPM");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [formingGDC, setFormingGDC] = useState<any>(null);
    const [commodityOptions, setCommodityOptions] = useState<{ name: string; label: string; icon: string }[]>([]);

    const TPIA_PRICE = 1000000; // ₦1,000,000
    const totalPrice = TPIA_PRICE * quantity;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    useEffect(() => {
        fetchWalletBalance();
        fetchGDCStatus();
        fetchCommodityTypes();
    }, []);

    const fetchCommodityTypes = async () => {
        try {
            const response = await apiGet<{ success: boolean; data: any[] }>("/api/v1/gdip/commodities/types");
            if (response.success && response.data) {
                setCommodityOptions(response.data);
            }
        } catch (err) {
            console.error("Error fetching commodity types:", err);
        }
    };

    const fetchGDCStatus = async () => {
        try {
            const response = await apiGet<{ success: boolean; data: any }>("/api/v1/gdip/forming-gdc");
            if (response.success && response.data) {
                setFormingGDC(response.data);
            }
        } catch (err) {
            console.error("Error fetching GDC status:", err);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const response = await apiGet<{ data: { ngnWallet: { available: number } } }>("/api/v1/wallets/summary");
            if (response.data?.ngnWallet?.available !== undefined) {
                setWalletBalance(response.data.ngnWallet.available);
            }
        } catch (err: any) {
            console.error("Error fetching wallet balance:", err);
        }
    };

    const handlePurchase = async () => {
        if (!selectedCommodity) {
            setError("Please select a commodity type");
            return;
        }

        // Check wallet balance
        if (walletBalance < totalPrice) {
            setShowTopUpModal(true);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await apiPost<{ success: boolean; message: string; data: any }>(
                "/api/v1/gdip/tpia/purchase",
                {
                    commodityType: selectedCommodity,
                    profitMode,
                    purchasePrice: TPIA_PRICE,
                    quantity,
                }
            );

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/gdip");
                }, 2000);
            }
        } catch (err: any) {
            console.error("Error purchasing TPIA:", err);
            setError(err.message || "Failed to purchase TPIA");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h2>
                    <p className="text-gray-600 mb-6">Your TPIA block(s) have been created and assigned to GDC clusters.</p>
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-4xl mx-auto">
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Purchase TPIA</h1>
                    <p className="text-gray-600">
                        Trade Partners Insured Alliance - Commodity-backed Investment Block
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Purchase Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Details</h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Commodity Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select Commodity Type *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {commodityOptions.length > 0 ? (
                                    commodityOptions.map((commodity) => (
                                        <button
                                            key={commodity.name}
                                            onClick={() => setSelectedCommodity(commodity.name)}
                                            className={`p-4 rounded-xl border-2 transition-all ${selectedCommodity === commodity.name
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-gray-200 hover:border-blue-300"
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">{commodity.icon}</div>
                                            <div className="font-medium text-gray-900">{commodity.label}</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-full h-24 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profit Mode Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Profit Distribution Mode *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* TPM Mode */}
                                <button
                                    onClick={() => setProfitMode("TPM")}
                                    className={`p-6 rounded-xl border-2 text-left transition-all ${profitMode === "TPM"
                                        ? "border-purple-600 bg-purple-50"
                                        : "border-gray-200 hover:border-purple-300"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg text-gray-900">TPM</h3>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            Compounding
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Trade Profit Mode</p>
                                    <p className="text-xs text-gray-500">
                                        Profits automatically reinvest into your TPIA, increasing value for next cycle
                                    </p>
                                </button>

                                {/* EPS Mode */}
                                <button
                                    onClick={() => setProfitMode("EPS")}
                                    className={`p-6 rounded-xl border-2 text-left transition-all ${profitMode === "EPS"
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-gray-200 hover:border-blue-300"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg text-gray-900">EPS</h3>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            Withdrawal
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Earning Payout System</p>
                                    <p className="text-xs text-gray-500">
                                        Profits credited to your wallet for immediate withdrawal
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Quantity Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Number of Blocks *
                            </label>
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-14 w-full md:w-48">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-14 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-r border-gray-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                                        className="flex-1 text-center font-bold text-lg text-gray-900 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                        className="w-14 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-l border-gray-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex-1 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setQuantity(1)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${quantity === 1 ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}
                                    >
                                        1 Block
                                    </button>
                                    {formingGDC && (formingGDC.capacity - formingGDC.currentFill) > 0 && (
                                        <button
                                            onClick={() => setQuantity(formingGDC.capacity - formingGDC.currentFill)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${quantity === (formingGDC.capacity - formingGDC.currentFill) ? "bg-green-600 text-white" : "bg-white text-green-600 border border-green-200 hover:bg-green-50"}`}
                                        >
                                            ✨ Fill GDC Slot{formingGDC.capacity - formingGDC.currentFill > 1 ? 's' : ''} ({formingGDC.capacity - formingGDC.currentFill})
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setQuantity(10)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${quantity === 10 ? "bg-purple-600 text-white" : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"}`}
                                    >
                                        🏆 Buy Full GDC (10)
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Each TPIA block is ₦1,000,000. You can purchase up to 10 blocks (one full GDC) at once.
                            </p>
                        </div>

                        {/* GDC Status */}
                        {formingGDC && (
                            <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-green-800">Current GDC Cluster: GDC-{formingGDC.gdcNumber}</span>
                                    <span className="text-xs font-bold text-green-600 uppercase">Active Formation</span>
                                </div>
                                <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(formingGDC.currentFill / formingGDC.capacity) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-green-700">
                                    <span>{formingGDC.currentFill} of {formingGDC.capacity} slots filled</span>
                                    <span>{formingGDC.capacity - formingGDC.currentFill} slots remaining</span>
                                </div>
                            </div>
                        )}

                        {/* Purchase Button */}
                        <button
                            onClick={handlePurchase}
                            disabled={loading || !selectedCommodity}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </span>
                            ) : (
                                `Purchase ${quantity} TPIA${quantity > 1 ? 's' : ''} for ${formatCurrency(totalPrice)}`
                            )}
                        </button>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Investment Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Quantity:</span>
                                    <span className="font-bold text-gray-900">{quantity} Block{quantity > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Unit Price:</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(TPIA_PRICE)}</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t">
                                    <span className="text-lg font-bold text-gray-900">Total Price:</span>
                                    <span className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t">
                                    <span className="text-gray-600">Wallet Balance:</span>
                                    <span className={`font-bold ${walletBalance >= totalPrice ? "text-green-600" : "text-red-600"}`}>
                                        {formatCurrency(walletBalance)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-900 mb-3">What You Get:</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Insurance certificate
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Commodity backing
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        GDC assignment
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Automated trade cycles
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Capital protection
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insufficient Funds Modal */}
                {showTopUpModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Insufficient Funds</h3>
                            <p className="text-center text-gray-600 mb-6">
                                You need to top up your wallet to complete this purchase.
                            </p>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Required Amount:</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(TPIA_PRICE)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Current Balance:</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(walletBalance)}</span>
                                </div>
                                <div className="my-2 border-t border-gray-200"></div>
                                <div className="flex justify-between text-base">
                                    <span className="font-bold text-gray-900">Top-up Needed:</span>
                                    <span className="font-bold text-red-600">{formatCurrency(TPIA_PRICE - walletBalance)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowTopUpModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => router.push("/profile/wallet")}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Top Up Wallet
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
