"use client";
import { useEffect, useState, Suspense } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { apiGet } from "@/utils/api";
import { getStoredLocale, translate, Locale, defaultLocale } from "@/utils/i18n";


type VerifyResponse = { status: string; data: { ok: boolean } };

function CheckoutCallbackForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<"verifying" | "success" | "failed">("verifying");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocale(getStoredLocale());
    const handleLocaleChange = (e: CustomEvent) => setLocale(e.detail);
    window.addEventListener("i18n:locale", handleLocaleChange as EventListener);
    return () => window.removeEventListener("i18n:locale", handleLocaleChange as EventListener);
  }, []);

  useEffect(() => {
    const provider = params.get("provider") || "paystack";
    const oid = params.get("orderId");
    if (oid) setOrderId(oid);
    const reference =
      params.get("reference") ||
      params.get("trxref") ||
      params.get("tx_ref") ||
      params.get("transaction_id");
    if (!reference) {
      setState("failed");
      return;
    }
    (async () => {
      try {
        const res = await apiGet<VerifyResponse>(`/api/v1/payments/verify`, { query: { provider, reference, orderId: oid || undefined } });
        setState(res.data.ok ? "success" : "failed");
      } catch {
        setState("failed");
      }
    })();
  }, [params]);

  useEffect(() => {
    if (state === "success" && orderId) {
      try {
        localStorage.setItem("cart", JSON.stringify([]));
        window.dispatchEvent(new CustomEvent("cart:update", { detail: { count: 0 } }));
      } catch { }
      const t = setTimeout(() => router.replace(`/checkout/success?orderId=${orderId}`), 900);
      return () => clearTimeout(t);
    }
  }, [state, router, orderId]);

  return (
    <main className="mx-auto w-[95%] px-3 md:px-6 py-10">
      {state === "verifying" && <p className="text-neutral-600">{translate(locale, "checkout.callback.verifying")}</p>}
      {state === "success" && <p className="text-emerald-600 font-semibold">{translate(locale, "checkout.callback.success")}</p>}
      {state === "failed" && <p className="text-rose-600 font-semibold">{translate(locale, "checkout.callback.failed")}</p>}
    </main>
  );
}

export default function CheckoutCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutCallbackForm />
    </Suspense>
  );
}

