"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FileText,
    Printer,
    ArrowLeft,
    Building2,
    MapPin,
    Globe,
    Mail,
    Phone,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    Layers,
    Wallet,
    Download
} from "lucide-react";
import { apiGet } from "@/utils/api";

interface TPIADetails {
    tpia: any;
    gdc: any;
    insurance: any;
}

export default function PurchaseInvoicePage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<TPIADetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGet<any>(`/api/v1/gdip/tpia/${id}`);
                if (response.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Error fetching TPIA data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Generating Invoice...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Invoice Not Found</h1>
                    <p className="text-slate-500 mb-6">We couldn't locate the purchase record for this TPIA.</p>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { tpia } = data;
    const invoiceNumber = `INV-GDIP-${tpia.tpiaNumber.toString().padStart(6, '0')}`;
    const purchaseDate = new Date(tpia.purchasedAt || tpia.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
            {/* Action Bar - Hidden on Print */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Details
                </button>

                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                    <Download size={18} />
                    Download Invoice
                </button>
            </div>

            {/* Invoice Document */}
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
                {/* Header Strip */}
                <div className="h-2 bg-emerald-600"></div>

                <div className="p-8 sm:p-12">
                    {/* Logo & Document Type */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Globe className="text-emerald-600" size={28} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 leading-none">GLOTRADE</h1>
                                    <p className="text-xs font-bold text-emerald-600 tracking-[0.2em] uppercase mt-1">International</p>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm text-slate-500">
                                <p className="flex items-center gap-2"><MapPin size={14} /> 123 Business Avenue, Lagos, Nigeria</p>
                                <p className="flex items-center gap-2"><Globe size={14} /> www.glotrade.com</p>
                                <p className="flex items-center gap-2"><Mail size={14} /> accounts@glotrade.com</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">INVOICE</h2>
                            <div className="flex flex-col items-end gap-1">
                                <p className="text-sm text-slate-400 font-medium">Invoice Number</p>
                                <p className="text-lg font-mono font-bold text-emerald-600 uppercase">{invoiceNumber}</p>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 mb-12" />

                    {/* Billing Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Billed To</h3>
                            <div className="p-5 bg-slate-50 rounded-2xl">
                                <p className="text-lg font-bold text-slate-900 mb-1">{tpia.partnerName}</p>
                                <p className="text-slate-600 mb-3">{tpia.partnerEmail}</p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                    <ShieldCheck size={12} />
                                    Verified Partner
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-end text-right">
                            <div className="space-y-3">
                                <div className="flex justify-between sm:justify-end gap-8">
                                    <span className="text-slate-400 text-sm">Issue Date</span>
                                    <span className="text-slate-900 font-semibold">{purchaseDate}</span>
                                </div>
                                <div className="flex justify-between sm:justify-end gap-8">
                                    <span className="text-slate-400 text-sm">Payment Status</span>
                                    <span className="text-emerald-600 font-bold flex items-center gap-1.5 justify-end uppercase tracking-wider text-xs">
                                        <CheckCircle2 size={14} /> Paid In Full
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Table */}
                    <div className="mb-12">
                        <div className="w-full overflow-hidden border border-slate-100 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Unit</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="px-6 py-8">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <Layers className="text-slate-500" size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 mb-1">GDIP TPIA Trade Block</p>
                                                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                                                        Block Number: #{tpia.tpiaNumber} assigned to GDC Cluster #{tpia.gdcNumber}.
                                                        Commodity backing: {tpia.commodityType || "Mixed"}.
                                                        Includes full capital protection insurance.
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-center align-top">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">1</span>
                                        </td>
                                        <td className="px-6 py-8 text-right align-top">
                                            <p className="text-lg font-bold text-slate-900">₦{tpia.purchasePrice.toLocaleString()}.00</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Calculation Summary */}
                    <div className="flex justify-end mb-16">
                        <div className="w-full sm:w-80 space-y-4">
                            <div className="flex justify-between items-center text-slate-500 text-sm">
                                <span>Subtotal</span>
                                <span>₦{tpia.purchasePrice.toLocaleString()}.00</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 text-sm">
                                <span>Discount</span>
                                <span>₦0.00</span>
                            </div>
                            <div className="h-px bg-slate-100"></div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-900 font-bold">Total Amount</span>
                                <span className="text-2xl font-black text-emerald-600">₦{tpia.purchasePrice.toLocaleString()}.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end p-8 bg-slate-50 rounded-3xl">
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
                                <Wallet className="text-emerald-600" size={16} />
                                Payment Method
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                This transaction was processed via the **GloTrade Internal Wallet System**.
                                Funds were successfully deducted from balance at the time of purchase.
                            </p>
                        </div>

                        <div className="text-right space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Electronic Transaction ID</p>
                            <p className="text-xs font-mono text-slate-500 select-all">{tpia._id}</p>
                            <div className="flex items-center justify-end gap-2 mt-4 text-emerald-600 font-bold text-xs uppercase tracking-tighter">
                                <ShieldCheck size={14} /> Official GloTrade Document
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-xs text-slate-300 font-medium">
                            Glotrade International Platform © 2025. This is a computer-generated document and requires no physical signature.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
