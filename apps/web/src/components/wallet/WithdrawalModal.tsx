
import React, { useState, useEffect } from "react";
import { X, AlertCircle, Building, CreditCard, User, Loader2 } from "lucide-react";
import { apiPost, apiGet } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { translate } from "@/utils/translate";

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    availableBalance: number; // in Naira
}

interface Bank {
    name: string;
    code: string;
}

export default function WithdrawalModal({ isOpen, onClose, onSuccess, availableBalance }: WithdrawalModalProps) {
    const [amount, setAmount] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [error, setError] = useState("");
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchBanks();
        }
    }, [isOpen]);

    useEffect(() => {
        if (accountNumber.length === 10 && bankCode) {
            resolveAccount();
        } else {
            setAccountName("");
        }
    }, [accountNumber, bankCode]);

    const fetchBanks = async () => {
        try {
            setLoadingBanks(true);
            const res = await apiGet("/api/v1/withdrawals/banks") as { data: Bank[] };
            setBanks(res.data);
        } catch (err) {
            console.error("Error fetching banks:", err);
            toast(translate("wallet.modals.withdrawal.loadingBanksError"), "error");
        } finally {
            setLoadingBanks(false);
        }
    };

    const resolveAccount = async () => {
        try {
            setIsResolving(true);
            setError("");
            const res = await apiGet(`/api/v1/withdrawals/resolve-account?accountNumber=${accountNumber}&bankCode=${bankCode}`) as { data: { accountName: string } };
            setAccountName(res.data.accountName);
        } catch (err: any) {
            console.error("Error resolving account:", err);
            setAccountName("");
            setError(err.message || translate("wallet.modals.withdrawal.resolveError"));
        } finally {
            setIsResolving(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!amount || parseFloat(amount) <= 0) {
            setError(translate("wallet.modals.withdrawal.invalidAmount"));
            return;
        }

        if (parseFloat(amount) > availableBalance) {
            setError(translate("wallet.modals.withdrawal.insufficientBalance"));
            return;
        }

        if (!bankCode || !accountNumber || !accountName) {
            setError(translate("wallet.modals.withdrawal.missingDetails"));
            return;
        }

        setIsLoading(true);

        try {
            const amountInNaira = parseFloat(amount);

            await apiPost("/api/v1/withdrawals/request", {
                amount: amountInNaira,
                bankDetails: {
                    bankName: banks.find(b => b.code === bankCode)?.name || bankName,
                    accountNumber,
                    accountName,
                    bankCode
                }
            });

            toast(translate("wallet.toasts.withdrawSuccess"), "success");
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Withdrawal error:", err);
            setError(err.message || translate("wallet.toasts.withdrawError"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {translate("wallet.modals.withdrawal.title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {translate("wallet.modals.withdrawal.amountLabel")}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {translate("wallet.modals.withdrawal.available", { amount: availableBalance.toLocaleString() })}
                        </p>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                            {translate("wallet.modals.withdrawal.bankTitle")}
                        </h3>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{translate("wallet.modals.withdrawal.bankName")}</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                <select
                                    value={bankCode}
                                    onChange={(e) => setBankCode(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                    disabled={loadingBanks}
                                >
                                    <option value="">{loadingBanks ? translate("wallet.modals.withdrawal.loadingBanks") : translate("wallet.modals.withdrawal.selectBank")}</option>
                                    {banks.map((bank, index) => (
                                        <option key={`${index}-${bank.code}`} value={bank.code}>
                                            {bank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{translate("wallet.modals.withdrawal.accountNumber")}</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0123456789"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{translate("wallet.modals.withdrawal.accountName")}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={accountName}
                                    readOnly
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-not-allowed"
                                    placeholder={isResolving ? translate("wallet.modals.withdrawal.resolving") : translate("wallet.modals.withdrawal.accountName")}
                                />
                                {isResolving && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            {translate("wallet.modals.withdrawal.cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isResolving || !accountName}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {translate("wallet.modals.withdrawal.processing")}
                                </>
                            ) : (
                                translate("wallet.modals.withdrawal.submit")
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

