"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { RequireGuest } from "@/components/auth/Guards";
import { Mail, AlertCircle, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import Modal from "@/components/common/Modal";

function LoginForm() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionEmail, setDeletionEmail] = useState("");
  const router = useRouter();
  const search = useSearchParams();

  // Helper function to detect if input is email or username
  const isEmail = (input: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowDeletionModal(false);
    setIsLoading(true);

    try {
      // Determine if input is email or username and send appropriate field
      const loginData = isEmail(loginInput)
        ? { email: loginInput, password }
        : { username: loginInput, password };

      const json = await apiPost<{ status: string; data: any }>("/api/v1/auth/login", loginData);

      // Save both user data and JWT token
      try {
        localStorage.setItem("afritrade:user", JSON.stringify(json.data));
        localStorage.setItem("afritrade:auth", json.data.token); // ← Save JWT token
        window.dispatchEvent(new CustomEvent("auth:update", { detail: { user: json.data } }));
      } catch { }

      toast("Signed in", "success");
      const next = search.get("next") || "/";
      router.replace(next);
    } catch (e: any) {
      // Check if this is a deletion-related error
      if (e.message && e.message.includes("Account is marked for deletion")) {
        // For deletion modal, we need to get the email from the response or use the input if it's an email
        setDeletionEmail(isEmail(loginInput) ? loginInput : "your registered email");
        setShowDeletionModal(true);
        // Don't show error toast for deletion - show modal instead
      } else {
        setError(e.message || "Login failed");
        toast(e.message || "Login failed", "error");
      }
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
              Welcome Back
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">Sign in to continue to your account</p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email/Username Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isEmail(loginInput) ? (
                      <Mail className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <User className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Enter your email or username"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link href="/auth/forgot" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Don't have an account?{" "}
                <Link href="/auth/register-business" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Account Deletion Modal */}
        <Modal
          open={showDeletionModal}
          onClose={() => setShowDeletionModal(false)}
          title="Account Reactivation Required"
          size="lg"
          footer={(
            <>
              <button
                onClick={() => setShowDeletionModal(false)}
                className="flex-1 rounded-full border px-4 py-2 text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDeletionModal(false);
                  // Optionally resend the reactivation email
                  toast("Reactivation email already sent. Please check your inbox.", "info");
                }}
                className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Got it
              </button>
            </>
          )}
        >
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
              Your account was marked for deletion and requires reactivation
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <div className="font-medium mb-1">Reactivation Email Sent</div>
                  <div>We've sent a reactivation link to:</div>
                  <div className="font-mono text-xs mt-1 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                    {deletionEmail}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <div className="font-medium text-amber-800 dark:text-amber-200 mb-2">What to do next:</div>
              <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the reactivation link in the email</li>
                <li>• Your account will be restored immediately</li>
                <li>• You can then log in normally</li>
              </ul>
            </div>

            <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/60">
              <div className="font-medium text-neutral-800 dark:text-neutral-200 mb-2">Need help?</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                If you don't receive the email within a few minutes, check your spam folder or contact support.
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </RequireGuest>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
