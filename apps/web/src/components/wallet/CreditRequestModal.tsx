"use client";

import { useState } from "react";
import { X, CreditCard, AlertCircle, CheckCircle, FileText } from "lucide-react";
import Modal from "@/components/common/Modal";
import { apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { translate } from "@/utils/translate";

interface CreditRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreditRequestModal({
    isOpen,
    onClose,
    onSuccess
}: CreditRequestModalProps) {
    const [requestedAmount, setRequestedAmount] = useState("");
    const [businessReason, setBusinessReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const MIN_AMOUNT = 50000;
    const MAX_AMOUNT = 10000000;
    const MIN_REASON_LENGTH = 20;
    const MAX_REASON_LENGTH = 1000;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate amount
        const amount = parseFloat(requestedAmount);
        if (isNaN(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
            setError(translate("wallet.modals.creditRequest.amountError", {
                min: `₦${MIN_AMOUNT.toLocaleString()}`,
                max: `₦${MAX_AMOUNT.toLocaleString()}`
            }));
            return;
        }

        // Validate business reason
        if (businessReason.length < MIN_REASON_LENGTH) {
            setError(translate("wallet.modals.creditRequest.minCharsError", { count: MIN_REASON_LENGTH }));
            return;
        }

        if (businessReason.length > MAX_REASON_LENGTH) {
            setError(translate("wallet.modals.creditRequest.maxCharsError", { count: MAX_REASON_LENGTH }));
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await apiPost("/api/v1/credit-requests", {
                requestedAmount: amount,
                businessReason: businessReason.trim()
            });

            toast(translate("wallet.toasts.creditSuccess"), "success");

            // Reset form
            setRequestedAmount("");
            setBusinessReason("");

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || translate("wallet.toasts.creditError");

            // Check for specific error types to show more helpful messages
            if (errorMessage.includes("one credit request per 30 days")) {
                setError(translate("wallet.modals.creditRequest.alreadySubmitted"));
            } else if (errorMessage.includes("pending")) {
                setError(translate("wallet.modals.creditRequest.pendingRequest"));
            } else {
                setError(errorMessage);
            }
            // Don't toast if we're showing it in the modal
            // toast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setRequestedAmount("");
            setBusinessReason("");
            setError("");
            onClose();
        }
    };

    return (
        <Modal open={isOpen} onClose={handleClose} title="">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {translate("wallet.modals.creditRequest.title")}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {translate("wallet.modals.creditRequest.subtitle")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Info Box */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-semibold mb-1">{translate("wallet.modals.creditRequest.guidelines")}</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                                <li>{translate("wallet.modals.creditRequest.guidelinesItems.0")}</li>
                                <li>{translate("wallet.modals.creditRequest.guidelinesItems.1")}</li>
                                <li>{translate("wallet.modals.creditRequest.guidelinesItems.2")}</li>
                                <li>{translate("wallet.modals.creditRequest.guidelinesItems.3")}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Requested Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {translate("wallet.modals.creditRequest.amountLabel")}
                        </label>
                        <input
                            type="number"
                            value={requestedAmount}
                            onChange={(e) => setRequestedAmount(e.target.value)}
                            placeholder="e.g., 100000"
                            min={MIN_AMOUNT}
                            max={MAX_AMOUNT}
                            step="1000"
                            required
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {translate("wallet.modals.creditRequest.amountRange", {
                                min: MIN_AMOUNT.toLocaleString(),
                                max: MAX_AMOUNT.toLocaleString()
                            })}
                        </p>
                    </div>

                    {/* Business Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {translate("wallet.modals.creditRequest.reasonLabel")}
                        </label>
                        <textarea
                            value={businessReason}
                            onChange={(e) => setBusinessReason(e.target.value)}
                            placeholder={translate("wallet.modals.creditRequest.reasonPlaceholder")}
                            rows={6}
                            minLength={MIN_REASON_LENGTH}
                            maxLength={MAX_REASON_LENGTH}
                            required
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="mt-1 flex justify-between text-xs">
                            <span className={`${businessReason.length < MIN_REASON_LENGTH
                                ? "text-red-500"
                                : "text-gray-500 dark:text-gray-400"
                                }`}>
                                {translate("wallet.modals.creditRequest.minChars", { count: MIN_REASON_LENGTH })}
                            </span>
                            <span className={`${businessReason.length > MAX_REASON_LENGTH
                                ? "text-red-500"
                                : businessReason.length >= MIN_REASON_LENGTH
                                    ? "text-green-500"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}>
                                {businessReason.length} / {MAX_REASON_LENGTH}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {translate("wallet.modals.creditRequest.cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !requestedAmount || businessReason.length < MIN_REASON_LENGTH}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {translate("wallet.modals.creditRequest.submitting")}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    {translate("wallet.modals.creditRequest.submit")}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
