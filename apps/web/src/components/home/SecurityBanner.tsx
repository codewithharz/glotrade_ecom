"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  CreditCard,
  Truck,
  Check,
  Bell,
  ArrowRight,
  X,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";

export default function SecurityBanner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Security Banner */}
      <div
        className=" hidden md:block mb-6 rounded-lg border border-emerald-200 overflow-hidden"
        data-security-banner
      >
        {/* Top Section - Dark Green Background */}
        <div className="bg-emerald-700 text-white px-4 py-3">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-2 ">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Why choose AfriTrade</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Secure privacy</span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Safe payments</span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span className="text-sm">Delivery guarantee</span>
              </div>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          {/* Mobile Layout - Only "Why choose AfriTrade" with clickable navigation */}
          <button
            onClick={() => setShowModal(true)}
            className="md:hidden w-full flex items-center justify-between hover:bg-emerald-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Why choose AfriTrade</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Section - White Background - Desktop Only */}
        <button
          onClick={() => setShowModal(true)}
          className="hidden md:block w-full bg-white px-4 py-3 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <Bell className="w-4 h-4" />
              <span className="text-sm">
                Security reminder: Please be wary of scam messages and links.
                AfriTrade won&apos;t ask for extra fees via SMS or email.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>View</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* Security Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center justify-center mx-10 gap-2">
            <div className="relative">
              <Shield className="w-8 h-8 text-emerald-600" />
              <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
            </div>
            <span className="text-lg font-semibold">Security reminder</span>
          </div>
        }
        size="md"
      >
        <div className="text-center space-y-4">
          <div className="text-sm text-neutral-600 leading-relaxed">
            AfriTrade values your privacy and security. We will never send
            requests for extra payments by SMS or email. If you receive any
            requests claiming to be from AfriTrade, we strongly suggest you
            ignore them and do not click on any links they may contain.
          </div>

          <div className="text-sm">
            Here are some{" "}
            <Link
              href="/security/fraud-cases"
              className="text-orange-600 hover:text-orange-700 font-medium underline"
            >
              common fraud cases
            </Link>{" "}
            for reference.
          </div>

          {/* OK Button positioned before the report text */}
          <button
            onClick={() => setShowModal(false)}
            className="w-1/2 rounded-full bg-orange-500 text-white px-6 py-3 font-semibold hover:bg-orange-600 transition-colors"
          >
            OK
          </button>

          <div className="text-sm text-neutral-500">
            If you come across anything suspicious, please report it in time{" "}
            <Link
              href="/security/report"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              &gt;
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
