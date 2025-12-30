"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { translate, getStoredLocale } from "@/utils/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const locale = getStoredLocale();

  useEffect(() => {
    router.replace("/auth/register-business");
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-neutral-600 dark:text-neutral-400">{translate(locale, "auth.register.redirecting")}</p>
      </div>
    </div>
  );
}
