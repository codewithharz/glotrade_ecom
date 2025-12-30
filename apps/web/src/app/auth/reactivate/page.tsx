"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { apiGet } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { RequireGuest } from "@/components/auth/Guards";
import { CheckCircle, AlertCircle, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { translate, getStoredLocale } from "@/utils/i18n";

function ReactivateForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [deletionCount, setDeletionCount] = useState<number>(0);
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get('token');
  const locale = getStoredLocale();

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage(translate(locale, "auth.reactivate.noToken"));
      return;
    }

    // Attempt to reactivate the account
    const reactivateAccount = async () => {
      try {
        console.log("Attempting reactivation with token:", token);
        const data = await apiGet<{
          status: string;
          message: string;
          data: { ok: boolean; deletionCount: number }
        }>(`/api/v1/auth/reactivate?token=${token}`);

        console.log("Response data:", data);

        if (data.status === "success") {
          setStatus('success');
          setMessage(data.message || translate(locale, "auth.reactivate.success"));
          setDeletionCount(data.data.deletionCount || 0);

          // Auto-redirect after 3 seconds
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || translate(locale, "auth.reactivate.failed"));
        }
      } catch (error: any) {
        console.error("Reactivation error:", error);
        setStatus('error');
        setMessage(error.message || translate(locale, "auth.reactivate.failedGeneric"));
      }
    };

    reactivateAccount();
  }, [token, router, locale]);

  if (status === 'loading') {
    return (
      <RequireGuest>
        <main className="mx-auto w-[95%] px-3 md:px-6 py-8 max-w-md">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <h1 className="text-2xl font-semibold mb-2">{translate(locale, "auth.reactivate.titleLoading")}</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {translate(locale, "auth.reactivate.subtitleLoading")}
            </p>
          </div>
        </main>
      </RequireGuest>
    );
  }

  if (status === 'invalid') {
    return (
      <RequireGuest>
        <main className="mx-auto w-[95%] px-3 md:px-6 py-8 max-w-md">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-red-600 dark:text-red-400">
              {translate(locale, "auth.reactivate.titleInvalid")}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {translate(locale, "auth.reactivate.subtitleInvalid")}
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full rounded-full bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700 transition-colors"
              >
                {translate(locale, "auth.reactivate.returnToLogin")}
              </Link>
              <Link
                href="/auth/forgot"
                className="block w-full rounded-full border border-neutral-300 dark:border-neutral-700 px-4 py-3 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {translate(locale, "auth.forgot.title")}?
              </Link>
            </div>
          </div>
        </main>
      </RequireGuest>
    );
  }

  if (status === 'error') {
    return (
      <RequireGuest>
        <main className="mx-auto w-[95%] px-3 md:px-6 py-8 max-w-md">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-red-600 dark:text-red-400">
              {translate(locale, "auth.reactivate.titleFailed")}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full rounded-full bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700 transition-colors"
              >
                {translate(locale, "auth.reactivate.returnToLogin")}
              </Link>
              <Link
                href="/support"
                className="block w-full rounded-full border border-neutral-300 dark:border-neutral-700 px-4 py-3 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {translate(locale, "auth.reactivate.contactSupport")}
              </Link>
            </div>
          </div>
        </main>
      </RequireGuest>
    );
  }

  if (status === 'success') {
    return (
      <RequireGuest>
        <main className="mx-auto w-[95%] px-3 md:px-6 py-8 max-w-md">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-green-600 dark:text-green-400">
              {translate(locale, "auth.reactivate.titleSuccess")}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {message}
            </p>

            {deletionCount > 0 && (
              <div className="rounded-lg bg-amber-50 p-4 mb-6 dark:bg-amber-900/20">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {translate(locale, "auth.reactivate.deletionAttempt", { count: deletionCount })}
                  </span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {translate(locale, "auth.reactivate.deletionWarning")}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full rounded-full bg-green-600 text-white px-4 py-3 font-semibold hover:bg-green-700 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  {translate(locale, "auth.reactivate.continueToLogin")}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {translate(locale, "auth.reactivate.redirecting")}
              </p>
            </div>
          </div>
        </main>
      </RequireGuest>
    );
  }

  return null;
}

export default function ReactivatePage() {
  const locale = getStoredLocale();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{translate(locale, "common.loading")}</div>}>
      <ReactivateForm />
    </Suspense>
  );
}