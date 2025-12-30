import React, { useEffect, useState } from "react";
import { apiGet } from "@/utils/api";
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle, ArrowUpRight } from "lucide-react";
import { translate } from "@/utils/translate";

interface WithdrawalRequest {
    _id: string;
    amount: number;
    currency: string;
    status: "pending" | "approved" | "rejected" | "processing" | "completed" | "failed";
    createdAt: string;
    reference: string;
    bankDetails: {
        bankName: string;
        accountNumber: string;
    };
    adminNote?: string;
}

export default function WithdrawalHistory() {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadHistory = async () => {
        try {
            setIsLoading(true);
            const res = await apiGet("/api/v1/withdrawals/history") as { data: WithdrawalRequest[] };
            setRequests(res.data);
        } catch (err) {
            console.error("Error loading withdrawal history:", err);
            setError(translate("wallet.withdrawals.loadError"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" /> {translate("wallet.withdrawals.status.completed")}
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Clock className="w-3 h-3" /> {translate("wallet.withdrawals.status.pending")}
                    </span>
                );
            case "processing":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> {translate("wallet.withdrawals.status.processing")}
                    </span>
                );
            case "rejected":
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3 h-3" /> {translate(`wallet.withdrawals.status.${status}`)}
                    </span>
                );
            default:
                return <span className="text-gray-500">{status}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
                {error}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {translate("wallet.withdrawals.noHistory")}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                        <th className="px-4 py-3">{translate("wallet.withdrawals.table.date")}</th>
                        <th className="px-4 py-3">{translate("wallet.withdrawals.table.reference")}</th>
                        <th className="px-4 py-3">{translate("wallet.withdrawals.table.amount")}</th>
                        <th className="px-4 py-3">{translate("wallet.withdrawals.table.bank")}</th>
                        <th className="px-4 py-3">{translate("wallet.withdrawals.table.status")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {requests.map((request) => (
                        <tr key={request._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                {request.reference}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                ₦{request.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                                {request.bankDetails.bankName} ••• {request.bankDetails.accountNumber.slice(-4)}
                            </td>
                            <td className="px-4 py-3">
                                {getStatusBadge(request.status)}
                                {request.adminNote && (request.status === 'rejected' || request.status === 'failed') && (
                                    <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={request.adminNote}>
                                        {request.adminNote}
                                    </p>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
