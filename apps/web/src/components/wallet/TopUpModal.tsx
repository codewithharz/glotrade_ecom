"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import { apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { translate } from "@/utils/translate";

interface TopUpModalProps {
    open: boolean;
    onClose: () => void;
}

export default function TopUpModal({ open, onClose }: TopUpModalProps) {
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleTopUp = async () => {
        try {
            if (!amount || parseFloat(amount) <= 0) {
                toast(translate("wallet.modals.withdrawal.invalidAmount"), "error");
                return;
            }

            setIsLoading(true);
            const amountInNaira = parseFloat(amount);

            const result = await apiPost("/api/v1/wallets/topup", {
                amount: amountInNaira,
                currency: "NGN",
                provider: "paystack",
                returnUrl: `${window.location.origin}/profile/wallet/callback`
            }) as { data?: { paymentUrl: string; reference: string } };

            if (result.data?.paymentUrl) {
                window.location.href = result.data.paymentUrl;
            }
        } catch (error) {
            console.error("Error initiating top-up:", error);
            toast(translate("wallet.toasts.topUpError"), "error");
            setIsLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={translate("wallet.modals.topUp.title")}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translate("wallet.modals.topUp.amountLabel")}
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={translate("wallet.modals.topUp.placeholder")}
                        min="0"
                        step="0.01"
                        disabled={isLoading}
                    />
                </div>
                <button
                    onClick={handleTopUp}
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? translate("wallet.modals.topUp.processing") : translate("wallet.modals.topUp.submit")}
                </button>
            </div>
        </Modal>
    );
}
