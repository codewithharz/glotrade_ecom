"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiGet, apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";

type VerifyResponse = { status: string; data: { ok: boolean } };
type WalletBalance = {
  available: number;
  frozen: number;
  total: number;
  currency: "ATH" | "NGN";
};

function WalletCallbackForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<"verifying" | "success" | "failed">("verifying");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const provider = params.get("provider") || "paystack";
    const reference =
      params.get("reference") ||
      params.get("trxref") ||
      params.get("tx_ref") ||
      params.get("transaction_id");

    if (!reference) {
      setState("failed");
      return;
    }

    const verifyPayment = async () => {
      try {
        setIsProcessing(true);

        // Verify the payment
        const res = await apiGet<VerifyResponse>(`/api/v1/payments/verify`, {
          query: { provider, reference }
        });

        if (res.data.ok) {
          setState("success");

          // Get updated wallet balance
          try {
            const balanceRes = await apiGet<{ status: string; data: WalletBalance }>("/api/v1/wallets/balance", {
              query: { currency: "NGN", type: "user" }
            });
            setWalletBalance(balanceRes.data);
          } catch (balanceError) {
            console.error("Failed to fetch wallet balance:", balanceError);
          }

          // Show success toast
          toast("Wallet top-up successful!", "success");

          // Auto-redirect after 3 seconds with success parameter
          setTimeout(() => {
            router.replace("/profile/wallet?success=true");
          }, 3000);
        } else {
          setState("failed");
          toast("Payment verification failed", "error");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setState("failed");
        toast("Payment verification failed", "error");
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [params, router]);

  const handleContinue = () => {
    router.replace("/profile/wallet?success=true");
  };

  const handleRetry = () => {
    router.replace("/profile/wallet");
  };

  return (
    <main className="mx-auto w-[95%] px-3 md:px-6 py-10">
      <div className="max-w-md mx-auto">
        {state === "verifying" && (
          <div className="text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="text-blue-600 animate-spin" size={32} />
            </div>
            <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
              Verifying Payment
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Please wait while we verify your wallet top-up...
            </p>
            {isProcessing && (
              <div className="mt-4 text-sm text-neutral-500">
                Processing your payment...
              </div>
            )}
          </div>
        )}

        {state === "success" && (
          <div className="text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="text-emerald-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              Top-up Successful!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              Your wallet has been successfully topped up.
            </p>

            {walletBalance && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                  Updated Wallet Balance
                </h3>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {/* Display balance in Naira */}
                  ₦{walletBalance.available.toLocaleString()}
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Available Balance
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full px-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Continue to Wallet
              </button>
              <p className="text-xs text-neutral-500">
                Redirecting automatically in 5 seconds...
              </p>
            </div>
          </div>
        )}

        {state === "failed" && (
          <div className="text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <XCircle className="text-red-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Top-up Failed
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              We couldn't verify your payment. Please try again or contact support if the issue persists.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.replace("/profile/wallet")}
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Back to Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function WalletCallbackPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto w-[95%] px-3 md:px-6 py-10">
        <div className="text-center">
          <Loader2 className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </main>
    }>
      <WalletCallbackForm />
    </Suspense>
  );
}
