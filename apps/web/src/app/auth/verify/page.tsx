"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

function VerifyForm() {
  const search = useSearchParams();
  const router = useRouter();
  const token = search.get("token") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) { setStatus("error"); setMessage("Missing token"); return; }
      setStatus("loading");
      try {
        await apiGet<{ status: string; data: { ok: boolean } }>("/api/v1/auth/verify", { query: { token } });
        if (cancelled) return;
        setStatus("success");
        setMessage("Your email has been verified. You can now sign in.");
        toast("Email verified", "success");
        try {
          const raw = localStorage.getItem("afritrade:user");
          if (raw) {
            const obj = JSON.parse(raw);
            obj.emailVerified = true;
            localStorage.setItem("afritrade:user", JSON.stringify(obj));
            window.dispatchEvent(new CustomEvent("auth:update", { detail: { user: obj } }));
          }
        } catch { }
      } catch (e: any) {
        if (cancelled) return;
        setStatus("error");
        setMessage(e?.message || "Verification failed");
        toast(e?.message || "Verification failed", "error");
      }
    };
    run();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">

          {status === "loading" && (
            <div className="py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Verifying...</h1>
              <p className="text-neutral-600 dark:text-neutral-400">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-4">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Email Verified!</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">{message}</p>

              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="block w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => router.replace("/")}
                  className="block w-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="py-4">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
                <AlertCircle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Verification Failed</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">{message || "Invalid or expired token."}</p>

              <div className="space-y-3">
                <Link
                  href="/auth/register"
                  className="block w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Create an Account
                </Link>
                <Link
                  href="/"
                  className="block w-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          )}

          {status === "idle" && (
            <div className="py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">Initializing verification...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
