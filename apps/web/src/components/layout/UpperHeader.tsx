"use client";
import Link from "next/link";
import { Globe, HelpCircle, ShieldCheck } from "lucide-react";

import { useEffect, useState } from "react";
import { setStoredLocale, translate } from "@/utils/i18n";

export default function UpperHeader() {
  const [locale, setLocale] = useState<"en" | "fr">("en");

  useEffect(() => {
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: "en" | "fr" };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () =>
      window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  return (
    <div className="hidden lg:flex sticky top-0 z-50 w-full bg-[#2EA5FF] shadow-sm mx-auto pl-10 border-b">
      <div className="w-[95%] flex justify-between gap-5 py-2">
        <div className=" flex items-center gap-5 text-white text-sm font-semibold">
          <span>Need help? Call Us:</span>
          <span>(+234)902-900-4712</span>
        </div>

        <div className="flex items-center gap-3 text-white text-sm font-semibold">
          <Link
            href="/gdip"
            className="hover:underline whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <ShieldCheck size={16} /> {translate(locale, "navInsuredPartners")}
          </Link>
          <Link
            href="/support"
            className="hover:underline whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <HelpCircle size={16} /> {translate(locale, "navSupport")}
          </Link>
          <button
            onClick={() => setStoredLocale(locale === "en" ? "fr" : "en")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Globe size={16} /> {translate(locale, "language")}
          </button>
        </div>
      </div>
    </div>
  );
}
