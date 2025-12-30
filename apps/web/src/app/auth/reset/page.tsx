"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { RequireGuest } from "@/components/auth/Guards";
import { Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { translate, getStoredLocale } from "@/utils/i18n";

function ResetForm() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token") || "";
    const [pwd, setPwd] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const locale = getStoredLocale();

    useEffect(() => {
        if (!token) {
            toast(translate(locale, "auth.reset.missingToken"), "error");
        }
    }, [token, locale]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError(translate(locale, "auth.reset.missingToken"));
            return;
        }
        if (pwd.length < 6) {
            setError(translate(locale, "auth.reset.passwordTooShort"));
            return;
        }
        if (pwd !== confirm) {
            setError(translate(locale, "auth.reset.passwordMismatch"));
            return;
        }

        setIsLoading(true);

        try {
            await apiPost("/api/v1/auth/reset-password", { token, newPassword: pwd });
            toast(translate(locale, "auth.reset.toastSuccess"), "success");
            setTimeout(() => router.replace("/auth/login"), 1500);
        } catch (e: any) {
            setError(e.message || translate(locale, "auth.reset.failed"));
            toast(e.message || translate(locale, "auth.reset.failed"), "error");
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
                            {translate(locale, "auth.reset.title")}
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">{translate(locale, "auth.reset.subtitle")}</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* New Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    {translate(locale, "auth.reset.newPasswordLabel")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-neutral-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={pwd}
                                        onChange={(e) => setPwd(e.target.value)}
                                        placeholder={translate(locale, "auth.reset.newPasswordPlaceholder")}
                                        className="w-full pl-10 pr-12 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    {translate(locale, "auth.reset.confirmPasswordLabel")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-neutral-400" />
                                    </div>
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        required
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        placeholder={translate(locale, "auth.reset.confirmPasswordPlaceholder")}
                                        className="w-full pl-10 pr-12 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                    >
                                        {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
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
                                        <span>{translate(locale, "auth.reset.resetting")}</span>
                                    </>
                                ) : (
                                    <span>{translate(locale, "auth.reset.resetButton")}</span>
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

export default function ResetPage() {
    const locale = getStoredLocale();
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{translate(locale, "common.loading")}</div>}>
            <ResetForm />
        </Suspense>
    );
}
