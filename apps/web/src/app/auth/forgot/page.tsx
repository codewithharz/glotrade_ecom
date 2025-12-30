"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { RequireGuest } from "@/components/auth/Guards";
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { translate, getStoredLocale } from "@/utils/i18n";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const locale = getStoredLocale();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setIsLoading(true);

    try {
      await apiPost("/api/v1/auth/forgot-password", { email });
      setMsg(translate(locale, "auth.forgot.successMsg"));
      toast(translate(locale, "auth.forgot.toastSuccess"), "success");
      setTimeout(() => router.replace("/auth/login"), 3000);
    } catch (e: any) {
      setError(e.message || translate(locale, "auth.toast.requestFailed"));
      toast(e.message || translate(locale, "auth.toast.requestFailed"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RequireGuest>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
              {translate(locale, "auth.forgot.title")}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">{translate(locale, "auth.forgot.subtitle")}</p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {translate(locale, "auth.forgot.emailLabel")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={translate(locale, "auth.forgot.emailPlaceholder")}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {msg && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{msg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{translate(locale, "auth.forgot.sending")}</span>
                  </>
                ) : (
                  <span>{translate(locale, "auth.forgot.sendButton")}</span>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {translate(locale, "auth.forgot.backToSignIn")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RequireGuest>
  );
}
