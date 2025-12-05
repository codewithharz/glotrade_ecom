"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DeepLinkManager, WalletDeepLinkData } from "@/utils/deepLink";
import { RequireAuth } from "@/components/auth/Guards";
import { apiGet } from "@/utils/api";
import { getUserId } from "@/utils/auth";
import { toast } from "@/components/common/Toast";
import {
  Wallet,
  ArrowRight,
  Copy,
  Share2,
  QrCode,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

interface WalletInfo {
  walletId: string;
  displayName: string;
  username: string;
  email: string;
  profileImage?: string;
  isVerified: boolean;
}

function WalletShareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletDeepLinkData | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processDeepLink = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Parse deep link data
        const data = DeepLinkManager.parseWalletLink(searchParams);
        if (!data) {
          setError("Invalid wallet link");
          return;
        }

        setWalletData(data);

        // Fetch wallet owner info
        const response = await apiGet(`/api/v1/wallets/info?walletId=${data.walletId}`) as {
          status: string;
          data?: WalletInfo;
        };

        if (response.status === "success" && response.data) {
          setWalletInfo(response.data);
        } else {
          setError("Wallet not found");
        }
      } catch (error) {
        console.error("Error processing deep link:", error);
        setError("Failed to process wallet link");
      } finally {
        setIsLoading(false);
      }
    };

    processDeepLink();
  }, [searchParams]);

  const handleTransfer = () => {
    if (!walletData || !walletInfo) return;

    const currentUserId = getUserId();
    if (!currentUserId) {
      toast("Please log in to send money", "error");
      router.push("/auth/login");
      return;
    }

    // Redirect to wallet page with pre-filled transfer data
    const transferParams = new URLSearchParams({
      toUserId: walletInfo.walletId,
      amount: walletData.amount?.toString() || "",
      currency: walletData.currency || "NGN",
      description: walletData.description || ""
    });

    router.push(`/profile/wallet?transfer=true&${transferParams.toString()}`);
  };

  const handleCopyLink = async () => {
    if (!walletData) return;

    const success = await DeepLinkManager.copyWalletLink(walletData);
    if (success) {
      toast("Wallet link copied to clipboard!", "success");
    } else {
      toast("Failed to copy link", "error");
    }
  };

  const handleShare = async () => {
    if (!walletData || !walletInfo) return;

    const success = await DeepLinkManager.shareWalletLink(
      walletData,
      `Send money to ${walletInfo.displayName} (${walletInfo.walletId}) via Afritrade Wallet`
    );

    if (success) {
      toast("Wallet link shared!", "success");
    } else {
      toast("Failed to share link", "error");
    }
  };

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading wallet information...</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (error || !walletData || !walletInfo) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid Wallet Link
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "This wallet link is not valid or the wallet no longer exists."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Send Money
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You've been invited to send money via Afritrade Wallet
            </p>
          </div>

          {/* Wallet Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {walletInfo.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {walletInfo.displayName}
                  </h2>
                  {walletInfo.isVerified && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  @{walletInfo.username} • {walletInfo.walletId}
                </p>
              </div>
            </div>

            {/* Transfer Details */}
            {walletData.amount && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Suggested Amount</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {walletData.currency === 'NGN' ? '₦' : ''}{walletData.amount.toLocaleString()}
                    {walletData.currency === 'ATH' ? ' ATH' : ''}
                  </span>
                </div>
                {walletData.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    "{walletData.description}"
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleTransfer}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Send Money
                  </>
                )}
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-5 h-5" />
                Copy Link
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Secure Transfer
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This is a secure Afritrade Wallet link. Always verify the recipient's details before sending money.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

export default function WalletSharePage() {
  return (
    <Suspense fallback={
      <RequireAuth>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </RequireAuth>
    }>
      <WalletShareContent />
    </Suspense>
  );
}
