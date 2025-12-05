"use client";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  Check,
  X,
  Eye,
  EyeOff,
  Link
} from "lucide-react";
import { DeepLinkManager, WalletDeepLinkData } from "@/utils/deepLink";

interface QRCodeGeneratorProps {
  walletId: string;
  displayName?: string;
  amount?: number;
  currency?: string;
  onClose?: () => void;
}

export default function QRCodeGenerator({ 
  walletId, 
  displayName, 
  amount, 
  currency = "NGN",
  onClose 
}: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [deepLinkCopied, setDeepLinkCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code data using deep linking
  const generateQRData = () => {
    const walletData: WalletDeepLinkData = {
      type: 'wallet_transfer',
      walletId,
      displayName,
      amount: showAmount && amount ? amount : undefined,
      currency: showAmount && amount ? (currency as 'NGN' | 'ATH') : undefined
    };
    
    return DeepLinkManager.generateQRData(walletData);
  };

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsGenerating(true);
        const qrData = generateQRData();
        
        const options = {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M' as const
        };

        const dataUrl = await QRCode.toDataURL(qrData, options);
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateQR();
  }, [walletId, displayName, amount, currency, showAmount]);

  // Copy wallet ID to clipboard
  const copyWalletId = async () => {
    try {
      await navigator.clipboard.writeText(walletId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy wallet ID:", error);
    }
  };

  // Copy deep link to clipboard
  const copyDeepLink = async () => {
    const walletData: WalletDeepLinkData = {
      type: 'wallet_transfer',
      walletId,
      displayName,
      amount: showAmount && amount ? amount : undefined,
      currency: showAmount && amount ? (currency as 'NGN' | 'ATH') : undefined
    };
    
    const success = await DeepLinkManager.copyWalletLink(walletData);
    if (success) {
      setDeepLinkCopied(true);
      setTimeout(() => setDeepLinkCopied(false), 2000);
    }
  };

  // Share deep link
  const shareDeepLink = async () => {
    const walletData: WalletDeepLinkData = {
      type: 'wallet_transfer',
      walletId,
      displayName,
      amount: showAmount && amount ? amount : undefined,
      currency: showAmount && amount ? (currency as 'NGN' | 'ATH') : undefined
    };
    
    const success = await DeepLinkManager.shareWalletLink(
      walletData,
      `Send money to ${displayName || walletId} via Afritrade Wallet`
    );
    
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `afritrade-wallet-${walletId}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share QR code
  const shareQRCode = async () => {
    if (!qrCodeDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      
      const file = new File([blob], `afritrade-wallet-${walletId}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `AfriTrade Wallet - ${displayName || walletId}`,
          text: `Send money to ${displayName || walletId} via AfriTrade`,
          files: [file]
        });
      } else {
        // Fallback to copying the wallet ID
        await copyWalletId();
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      // Fallback to copying the wallet ID
      await copyWalletId();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                Share Wallet
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {displayName || walletId}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* QR Code Display */}
        <div className="text-center mb-4 sm:mb-6">
          {isGenerating ? (
            <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
              <img 
                src={qrCodeDataUrl} 
                alt="Wallet QR Code" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Wallet ID Display */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Wallet ID
          </label>
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <code className="flex-1 text-xs sm:text-sm font-mono text-gray-900 dark:text-white truncate">
              {walletId}
            </code>
            <button
              onClick={copyWalletId}
              className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex-shrink-0"
              title="Copy Wallet ID"
            >
              {copied ? (
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Amount Toggle (if amount is provided) */}
        {amount && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Include Amount in QR Code
              </label>
              <button
                onClick={() => setShowAmount(!showAmount)}
                className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  showAmount ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    showAmount ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {showAmount && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Amount: {amount.toLocaleString()} {currency}
              </p>
            )}
          </div>
        )}

        {/* Deep Link Buttons */}
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            Share Wallet Link
          </h4>
          <div className="flex gap-2">
            <button
              onClick={copyDeepLink}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors text-xs sm:text-sm"
            >
              {deepLinkCopied ? (
                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Link className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">{deepLinkCopied ? 'Copied!' : 'Copy Link'}</span>
              <span className="sm:hidden">{deepLinkCopied ? 'Copied!' : 'Copy'}</span>
            </button>
            
            <button
              onClick={shareDeepLink}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors text-xs sm:text-sm"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Share Link</span>
              <span className="sm:hidden">Share</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={downloadQRCode}
            disabled={isGenerating}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Download QR</span>
            <span className="sm:hidden">Download</span>
          </button>
          
          <button
            onClick={shareQRCode}
            disabled={isGenerating}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium"
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Share QR</span>
            <span className="sm:hidden">Share</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            How to use:
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>QR Code:</strong> Others can scan this QR code to send you money</li>
            <li>• <strong>Deep Link:</strong> Share the wallet link via messaging apps or social media</li>
            <li>• <strong>Wallet ID:</strong> Others can search for your Wallet ID manually</li>
            <li>• <strong>Compatible:</strong> Works with the AfriTrade app and web platform</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
