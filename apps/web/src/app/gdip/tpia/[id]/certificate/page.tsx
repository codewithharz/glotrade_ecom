"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet } from "@/utils/api";
import QRCode from "qrcode";
import { ArrowLeft, Printer, ShieldCheck, Award, Calendar, MapPin, Package, Download, Globe, ScanLine } from "lucide-react";

interface CertificateData {
    tpia: {
        tpiaId: string;
        tpiaNumber: number;
        partnerName: string;
        partnerEmail: string;
        purchasePrice: number;
        commodityType: string;
        commodityQuantity: number;
        commodityUnit: string;
        purchasedAt: string;
    };
    insurance: {
        certificateNumber: string;
        provider: string;
        coverageAmount: number;
        status: string;
        effectiveDate: string;
        expiryDate: string;
        warehouseLocation: string;
    };
}

export default function InsuranceCertificatePage() {
    const router = useRouter();
    const params = useParams();
    const tpiaId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CertificateData | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (tpiaId) {
            fetchCertificateData();
        }
    }, [tpiaId]);

    const fetchCertificateData = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: any }>(
                `/api/v1/gdip/tpia/${tpiaId}`
            );

            if (response.success) {
                setData({
                    tpia: response.data.tpia,
                    insurance: response.data.insurance
                });

                // Generate QR Code
                const verificationUrl = `${window.location.origin}/verify/${response.data.insurance.certificateNumber}`;
                try {
                    const qr = await QRCode.toDataURL(verificationUrl, {
                        width: 200,
                        margin: 1,
                        color: {
                            dark: "#064e3b", // green-900
                            light: "#ffffff",
                        },
                    });
                    setQrCodeUrl(qr);
                } catch (err) {
                    console.error("QR generation error:", err);
                }
            }
        } catch (err: any) {
            console.error("Error fetching certificate data:", err);
            setError(err.message || "Failed to load certificate data");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error || "Certificate not found"}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { tpia, insurance } = data;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
            {/* Action Bar - Hidden during print */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Details
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition-all shadow-md"
                >
                    <Printer className="w-5 h-5" />
                    Print Certificate
                </button>
            </div>

            {/* Certificate Container */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden relative print:shadow-none print:max-w-none">
                {/* Formal Border Decor */}
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-green-800 via-green-600 to-green-800"></div>
                <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-green-800 via-green-600 to-green-800"></div>
                <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-b from-green-800 via-green-600 to-green-800"></div>
                <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-b from-green-800 via-green-600 to-green-800"></div>

                <div className="p-16 sm:p-24 space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center mb-6 relative">
                            <div className="p-4 bg-green-100 rounded-full relative z-10">
                                <img
                                    src="/favicon.png"
                                    alt="GloTrade Logo"
                                    className="w-16 h-16 object-contain"
                                    onError={(e) => {
                                        // Fallback if image fails
                                        (e.target as any).style.display = 'none';
                                        (e.target as any).nextSibling.style.display = 'block';
                                    }}
                                />
                                <ShieldCheck className="w-16 h-16 text-green-700 hidden" />
                            </div>
                            {/* Decorative Seal Background */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                                <Globe className="w-64 h-64 text-green-900" />
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 tracking-tight">
                            INSURANCE CERTIFICATE
                        </h1>
                        <p className="text-lg text-green-800 font-medium tracking-widest uppercase">
                            Trade Partners Insured Alliance (TPIA)
                        </p>
                        <div className="w-32 h-1 bg-green-600 mx-auto mt-4"></div>
                    </div>

                    {/* Certificate ID */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-8">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Certificate Number</p>
                            <p className="text-xl font-mono font-bold text-gray-800">{insurance.certificateNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Issue Date</p>
                            <p className="text-lg font-medium text-gray-800">{formatDate(tpia.purchasedAt)}</p>
                        </div>
                    </div>

                    {/* Partner Content */}
                    <div className="space-y-8">
                        <div className="text-center">
                            <p className="text-gray-500 italic mb-2 font-serif text-lg">This document certifies that</p>
                            <h2 className="text-3xl font-bold text-gray-900 underline underline-offset-8 decoration-green-200">
                                {tpia.partnerName}
                            </h2>
                            <p className="text-green-700 mt-4 font-medium">{tpia.partnerEmail}</p>
                        </div>

                        <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 space-y-6">
                            <p className="text-gray-700 text-center leading-relaxed">
                                Is a registered and insured partner holding the investment block identified as
                                <span className="font-bold text-gray-900 mx-1">[{tpia.tpiaId}]</span>.
                                This asset is fully backed by physical commodities and protected under the GloTrade
                                Distribution Insured Partners (GDIP) risk management framework.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest">Coverage Amount</p>
                                            <p className="text-lg font-bold text-gray-800">{formatCurrency(insurance.coverageAmount)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest">Asset Backing</p>
                                            <p className="text-lg font-bold text-gray-800">{tpia.commodityQuantity} {tpia.commodityUnit} {tpia.commodityType}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest">Effective Period</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {formatDate(insurance.effectiveDate)} — {formatDate(insurance.expiryDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest">Logistics Hub</p>
                                            <p className="text-sm font-medium text-gray-800">{insurance.warehouseLocation || "GloTrade Strategic Reserve"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 pt-16">
                        <div className="text-center space-y-2">
                            <div className="border-t-2 border-gray-200 pt-2 mx-auto w-48">
                                <p className="text-sm font-bold text-gray-800">GloTrade Admin</p>
                                <p className="text-xs text-gray-400 uppercase tracking-widest">System Authorized</p>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="border-t-2 border-gray-200 pt-2 mx-auto w-48">
                                <p className="text-sm font-bold text-gray-800">{insurance.provider}</p>
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Insurance Underwriter</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Disclaimer */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-gray-100">
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <p className="text-[10px] text-gray-400 leading-tight max-w-md">
                                This certificate is a digital representation of the underlying insurance contract. Verify authenticity at glotrade.com/verify or by scanning the secure QR code. Underwritten for full capital protection of ₦1,000,000 per TPIA block.
                            </p>
                            <div className="flex justify-center md:justify-start pt-2 opacity-30">
                                <div className="w-16 h-16 border-4 border-green-200 rounded-full flex items-center justify-center font-serif font-bold text-green-100 text-xl transform -rotate-12">
                                    G-DP
                                </div>
                            </div>
                        </div>

                        {qrCodeUrl && (
                            <div className="flex flex-col items-center gap-2 p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <img src={qrCodeUrl} alt="Verification QR Code" className="w-24 h-24" />
                                <div className="flex items-center gap-1 text-[8px] font-bold text-green-800 uppercase tracking-widest">
                                    <ScanLine className="w-2 h-2" />
                                    Scan to Verify
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print Notice - Hidden during print */}
            <div className="max-w-4xl mx-auto mt-8 text-center print:hidden">
                <p className="text-sm text-gray-500">
                    Pro tip: For best results when printing, enable "Background Graphics" in your browser's print settings.
                </p>
            </div>
        </div>
    );
}
