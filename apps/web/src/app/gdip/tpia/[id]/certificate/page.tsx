"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

interface InsuranceCertificate {
    certificateNumber: string;
    tpiaId: string;
    tpiaNumber: number;
    partnerName: string;
    partnerEmail: string;
    provider: string;
    coverageAmount: number;
    effectiveDate: string;
    expiryDate: string;
    status: string;
    commodityType: string;
    commodityQuantity: number;
    warehouseLocation: string;
    issuedDate: string;
}

export default function InsuranceCertificatePage() {
    const params = useParams();
    const router = useRouter();
    const tpiaId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState<InsuranceCertificate | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (tpiaId) {
            fetchCertificate();
        }
    }, [tpiaId]);

    const fetchCertificate = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/insurance/certificate/${tpiaId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.data.success) {
                setCertificate(response.data.data);
            }
        } catch (err: any) {
            console.error("Error fetching certificate:", err);
            setError(err.response?.data?.error || "Failed to load certificate");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        // In a real implementation, this would generate and download a PDF
        alert("PDF generation feature coming soon!");
        // You can integrate with libraries like jsPDF or pdfmake here
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

    if (error || !certificate) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error || "Certificate not found"}</p>
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
                        Back
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Insurance Certificate</h1>
                            <p className="text-gray-600">TPIA Capital Protection Certificate</p>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* Certificate */}
                <div className="bg-white rounded-2xl shadow-2xl p-12 border-4 border-blue-600">
                    {/* Header */}
                    <div className="text-center mb-8 pb-8 border-b-2 border-gray-200">
                        <div className="text-6xl mb-4">🛡️</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">INSURANCE CERTIFICATE</h2>
                        <p className="text-lg text-gray-600">Glotrade Distribution Insured Partners</p>
                    </div>

                    {/* Certificate Number */}
                    <div className="bg-blue-50 rounded-xl p-6 mb-8 text-center">
                        <p className="text-sm text-gray-600 mb-2">Certificate Number</p>
                        <p className="text-2xl font-bold font-mono text-blue-600">{certificate.certificateNumber}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-6 mb-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Partner Name</p>
                                <p className="font-bold text-lg">{certificate.partnerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">TPIA ID</p>
                                <p className="font-bold text-lg">{certificate.tpiaId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Insurance Provider</p>
                                <p className="font-bold text-lg">{certificate.provider}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Coverage Amount</p>
                                <p className="font-bold text-lg text-green-600">{formatCurrency(certificate.coverageAmount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Effective Date</p>
                                <p className="font-bold text-lg">{formatDate(certificate.effectiveDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                                <p className="font-bold text-lg">{formatDate(certificate.expiryDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Commodity Type</p>
                                <p className="font-bold text-lg">{certificate.commodityType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${certificate.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {certificate.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {certificate.warehouseLocation && (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Warehouse Location</p>
                                <p className="font-bold text-lg">{certificate.warehouseLocation}</p>
                            </div>
                        )}
                    </div>

                    {/* Coverage Details */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <h3 className="font-bold text-lg mb-4">Coverage Details</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>100% capital protection against commodity loss or damage</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Coverage for warehouse storage risks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Protection during commodity trading cycles</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Claims processing within 30 business days</span>
                            </li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-8 border-t-2 border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Issued on {formatDate(certificate.issuedDate)}</p>
                        <p className="text-xs text-gray-500">
                            This certificate is valid and verifiable. For verification, contact {certificate.provider}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
