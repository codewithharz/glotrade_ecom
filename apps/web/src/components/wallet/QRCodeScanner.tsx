"use client";
import { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  Camera, 
  X, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { DeepLinkManager } from "@/utils/deepLink";
import jsQR from "jsqr";

interface QRCodeScannerProps {
  onScan: (data: any) => void;
  onClose: () => void;
}

interface QRScanResult {
  type: string;
  walletId: string;
  displayName?: string;
  amount?: number;
  currency?: string;
  timestamp?: string;
  app?: string;
}

export default function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualWalletId, setManualWalletId] = useState("");
  const [manualInputError, setManualInputError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check for camera permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Check if we're on HTTPS (required for camera access)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          setError("Camera access requires HTTPS. Please use the secure version of this site.");
          setHasPermission(false);
          return;
        }

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Camera access is not supported on this device.");
          setHasPermission(false);
          return;
        }

        // Try to access camera to check permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment',
              width: { ideal: 640 },
              height: { ideal: 480 }
            } 
          });
          stream.getTracks().forEach(track => track.stop());
          setHasPermission(true);
        } catch (error: any) {
          console.error("Camera access error:", error);
          if (error.name === 'NotAllowedError') {
            setError("Camera permission denied. Please allow camera access in your browser settings.");
          } else if (error.name === 'NotFoundError') {
            setError("No camera found on this device.");
          } else if (error.name === 'NotSupportedError') {
            setError("Camera access is not supported on this device.");
          } else {
            setError("Unable to access camera. Please check your device settings.");
          }
          setHasPermission(false);
        }
      } catch (error) {
        console.error("Permission check error:", error);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  // Start camera and scanning
  const startScanning = async () => {
    try {
      setError("");
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Start scanning loop
      scanLoop();
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setIsScanning(false);
      
      if (error.name === 'NotAllowedError') {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else if (error.name === 'NotFoundError') {
        setError("No camera found on this device.");
      } else if (error.name === 'NotSupportedError') {
        setError("Camera access is not supported on this device.");
      } else if (error.name === 'NotReadableError') {
        setError("Camera is already in use by another application.");
      } else {
        setError("Unable to access camera. Please check your device settings.");
      }
    }
  };

  // Stop scanning
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // QR Code scanning loop
  const scanLoop = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Simple QR code detection (in a real app, you'd use a library like jsQR)
    // For now, we'll simulate detection
    try {
      // This is a placeholder - in production, use a proper QR code library
      const qrData = detectQRCode(imageData);
      
      if (qrData) {
        try {
          // First try to parse as deep link QR data
          const deepLinkData = DeepLinkManager.parseQRData(qrData);
          if (deepLinkData) {
            stopScanning();
            onScan(deepLinkData);
            return;
          }

          // Fallback to legacy JSON format
          const parsedData = JSON.parse(qrData);
          if (parsedData.type === 'wallet_transfer' && parsedData.walletId) {
            stopScanning();
            onScan(parsedData);
            return;
          }
        } catch (parseError) {
          // Try to parse as simple wallet ID
          if (qrData.startsWith('WAL-')) {
            stopScanning();
            onScan({ type: 'wallet_transfer', walletId: qrData });
            return;
          }
        }
      }
    } catch (error) {
      console.error("QR detection error:", error);
    }

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanLoop);
    }
  };

  // QR detection function using jsQR library
  const detectQRCode = (imageData: ImageData): string | null => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      return code ? code.data : null;
    } catch (error) {
      console.error("QR detection error:", error);
      return null;
    }
  };

  // Handle manual input modal
  const handleManualInput = () => {
    setShowManualInput(true);
    setManualWalletId("");
    setManualInputError("");
  };

  // Validate and submit manual wallet ID
  const handleSubmitManualInput = () => {
    const walletId = manualWalletId.trim();
    
    if (!walletId) {
      setManualInputError("Please enter a Wallet ID");
      return;
    }
    
    if (!walletId.startsWith('WAL-')) {
      setManualInputError("Invalid Wallet ID format. Please use format: WAL-1234-ABCD");
      return;
    }
    
    // Close modal and process the wallet ID
    setShowManualInput(false);
    onScan({ type: 'wallet_transfer', walletId });
  };

  // Close manual input modal
  const handleCloseManualInput = () => {
    setShowManualInput(false);
    setManualWalletId("");
    setManualInputError("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Manual Input Modal
  if (showManualInput) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl">
          <div className="text-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mx-auto mb-4">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Enter Wallet ID
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Enter the Wallet ID manually (e.g., WAL-1234-ABCD)
            </p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={manualWalletId}
                  onChange={(e) => {
                    setManualWalletId(e.target.value);
                    setManualInputError("");
                  }}
                  placeholder="WAL-1234-ABCD"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitManualInput();
                    } else if (e.key === 'Escape') {
                      handleCloseManualInput();
                    }
                  }}
                />
                {manualInputError && (
                  <p className="text-red-500 text-xs mt-1 text-left">{manualInputError}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCloseManualInput}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitManualInput}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Camera Permission Required
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              Please allow camera access to scan QR codes, or enter the Wallet ID manually.
            </p>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={handleManualInput}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
              >
                Enter Wallet ID Manually
              </button>
              <button
                onClick={onClose}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                Scan QR Code
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                Point camera at QR code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative flex-1 min-h-0">
          <video
            ref={videoRef}
            className="w-full h-48 sm:h-64 object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 sm:w-48 sm:h-48 border-2 border-blue-500 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-spin" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 flex-shrink-0">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              Start Scanning
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base font-medium"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              Stop Scanning
            </button>
          )}
          
          <button
            onClick={handleManualInput}
            className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium"
          >
            <span className="hidden sm:inline">Enter Wallet ID Manually</span>
            <span className="sm:hidden">Enter Wallet ID</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
            How to scan:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Point your camera at the QR code</li>
            <li>• Make sure the QR code is well-lit and in focus</li>
            <li>• Hold steady until the code is detected</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
