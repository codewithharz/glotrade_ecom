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
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { getStoredLocale, Locale, translate } from "@/utils/i18n";

export default function SecurityBanner() {
  const [showModal, setShowModal] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getStoredLocale());
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () => window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  return (
    <>
      {/* Security Banner */}
      <div
        className="hidden md:block mb-6 rounded-lg border border-emerald-200 overflow-hidden"
        data-security-banner
      >
        {/* Top Section - Dark Green Background */}
        <div className="bg-emerald-700 text-white px-4 py-3">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-2 ">
              <Shield className="w-5 h-5" />
              <span className="font-medium">{translate(locale, "whyChoose")}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm">{translate(locale, "securePrivacy")}</span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">{translate(locale, "security.safePayments")}</span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span className="text-sm">{translate(locale, "deliveryGuarantee")}</span>
              </div>
              <ArrowRight className={`w-4 h-4 ml-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Mobile Layout - Only "Why choose GloTrade" with clickable navigation */}
          <button
            onClick={() => setShowModal(true)}
            className="md:hidden w-full flex items-center justify-between hover:bg-emerald-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">{translate(locale, "whyChoose")}</span>
            </div>
            <ArrowRight className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Bottom Section - White Background - Desktop Only */}
        <button
          onClick={() => setShowModal(true)}
          className="hidden md:block w-full bg-white px-4 py-3 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 text-start">
              <Bell className="w-4 h-4 shrink-0" />
              <span className="text-sm">
                {translate(locale, "securityReminder")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>{translate(locale, "view")}</span>
              <ArrowRight className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
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
            <span className="text-lg font-semibold">{translate(locale, "securityCertification")}</span>
          </div>
        }
        size="md"
      >
        <div className="text-center space-y-4">
          <div className="text-sm text-neutral-600 leading-relaxed">
            {translate(locale, "security.modalMessage")}
          </div>

          <div className="text-sm">
            {translate(locale, "security.fraudCasesIntro")}{" "}
            <Link
              href="/security/fraud-cases"
              className="text-orange-600 hover:text-orange-700 font-medium underline"
            >
              {translate(locale, "security.commonFraudCases")}
            </Link>{" "}
            {translate(locale, "security.forReference")}
          </div>

          <button
            onClick={() => setShowModal(false)}
            className="w-1/2 rounded-full bg-orange-500 text-white px-6 py-3 font-semibold hover:bg-orange-600 transition-colors"
          >
            {translate(locale, "ok")}
          </button>

          <div className="text-sm text-neutral-500">
            {translate(locale, "security.reportSuspicious")}{" "}
            <Link
              href="/security/report"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {locale === 'ar' ? '<' : '>'}
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
