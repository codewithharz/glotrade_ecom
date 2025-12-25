"use client";
import Link from "next/link";
import { Globe, HelpCircle, ShieldCheck, X } from "lucide-react";

import { useEffect, useState } from "react";
import { setStoredLocale, translate } from "@/utils/i18n";
import { useRouter } from "next/navigation";

export default function UpperHeader() {
  const router = useRouter();
  const [locale, setLocale] = useState<"en" | "fr">("en");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: "en" | "fr" };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () =>
      window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  const handleGDIPClick = (e: React.MouseEvent) => {
    const userData = localStorage.getItem("afritrade:user") || localStorage.getItem("user");
    if (!userData) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <div className="flex sticky top-0 z-[60] w-full bg-[#2EA5FF] shadow-sm border-b overflow-x-auto no-scrollbar">
      <div className="w-[95%] lg:w-[95%] mx-auto flex justify-between items-center gap-4 py-1.5 px-3 md:px-0">
        <div className="hidden sm:flex items-center gap-3 text-white text-[10px] md:text-sm font-semibold whitespace-nowrap">
          <span>Need help? Call Us:</span>
          <span>(+234)902-900-4712</span>
        </div>

        <div className="flex flex-1 sm:flex-none justify-center sm:justify-end items-center gap-4 md:gap-6 text-white text-[11px] md:text-sm font-semibold">
          <Link
            href="/gdip"
            onClick={handleGDIPClick}
            className="hover:underline whitespace-nowrap inline-flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <ShieldCheck size={16} className="md:w-[18px] md:h-[18px]" /> {translate(locale, "navInsuredPartners")}
          </Link>
          <Link
            href="/support"
            className="hover:underline whitespace-nowrap inline-flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <HelpCircle size={16} className="md:w-[18px] md:h-[18px]" /> {translate(locale, "navSupport")}
          </Link>
          <button
            onClick={() => setStoredLocale(locale === "en" ? "fr" : "en")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap transition-all hover:scale-105"
          >
            <Globe size={16} className="md:w-[18px] md:h-[18px]" /> {translate(locale, "language")}
          </button>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X size={20} className="text-neutral-500" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
                <ShieldCheck size={32} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Partner Access Required
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Join our Trusted Insured Partners platform. Please login or create an account to continue.
                </p>
              </div>

              <div className="w-full grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push("/auth/login?next=/gdip");
                  }}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  Login to Account
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push("/auth/register?next=/gdip");
                  }}
                  className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold rounded-xl transition-all active:scale-[0.98]"
                >
                  Create New Account
                </button>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
