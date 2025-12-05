"use client";
import Link from "next/link";
import { Suspense, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { CheckCircle, ShoppingBag, Package } from "lucide-react";

function CheckoutSuccessForm() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  // Clear cart on successful checkout
  useEffect(() => {
    localStorage.removeItem("cart");
    window.dispatchEvent(new CustomEvent("cart:update", { detail: { count: 0 } }));
  }, []);

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 rounded-full p-4">
                <CheckCircle className="text-white" size={48} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
            Order Successful!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">Your order has been placed successfully</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
          {/* Order ID Section */}
          {orderId && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{orderId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="mb-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Thank you for your purchase! We've sent a confirmation email with your order details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={`/orders/${orderId ?? ""}`}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Package className="h-5 w-5" />
              <span>View Order Details</span>
            </Link>

            <Link
              href="/"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold py-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Need help?{" "}
            <Link href="/support" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutSuccessForm />
    </Suspense>
  );
}

