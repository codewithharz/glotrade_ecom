"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function readUser(): any | null {
  try { const raw = localStorage.getItem("afritrade:user"); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function RequireAuth({ children, title = "Sign in required", message = "Please sign in to continue.", cancelRedirect = "/" }: { children: React.ReactNode; title?: string; message?: string; cancelRedirect?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [needsAuth, setNeedsAuth] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const user = readUser();
    if (!user) {
      setNeedsAuth(true);
    }
    setChecked(true);
  }, []);

  const goLogin = () => {
    const next = encodeURIComponent(pathname || "/");
    router.push(`/auth/login?next=${next}`);
  };

  return (
    <>
      {children}
      {checked && needsAuth ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-[92%] max-w-md rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-900 shadow-2xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
            <div className="mb-1 text-lg font-semibold">{title}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">{message}</div>
            <div className="mt-4 flex gap-2">
              <button onClick={goLogin} className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95">OK, sign in</button>
              <button onClick={() => router.replace(cancelRedirect)} className="flex-1 rounded-full border px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const user = readUser();
    if (user) {
      router.replace("/profile");
    } else {
      setShow(true);
    }
  }, [router]);
  if (!show) return null;
  return <>{children}</>;
}


export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = readUser();
    if (user && (user.role === "admin" || user.role === "superadmin" || user.isSuperAdmin)) {
      setAuthorized(true);
    } else {
      router.replace("/");
    }
    setChecking(false);
  }, [router]);

  if (checking) return null;
  return authorized ? <>{children}</> : null;
}

export function RequireDistributor({ children, title = "Partner Access Required", message = "Join our Trusted Insured Trade Partners platform. Only distributors have access to this page.", cancelRedirect = "/" }: { children: React.ReactNode; title?: string; message?: string; cancelRedirect?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "needs-auth" | "needs-distributor" | "authorized">("checking");

  useEffect(() => {
    const user = readUser();
    if (!user) {
      setStatus("needs-auth");
    } else if (user.businessInfo?.businessType !== "Distributor") {
      setStatus("needs-distributor");
    } else {
      setStatus("authorized");
    }
  }, []);

  const goLogin = () => {
    const next = encodeURIComponent(pathname || "/");
    router.push(`/auth/login?next=${next}`);
  };

  if (status === "checking") return null;
  if (status === "authorized") return <>{children}</>;

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative w-[92%] max-w-md rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-900 shadow-2xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
          <div className="mb-1 text-lg font-semibold">{status === "needs-auth" ? "Partner Access Required" : title}</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            {status === "needs-auth"
              ? "Join our Trusted Insured Trade Partners platform. Please login or create an account to continue."
              : message}
            <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Contact for Support</span>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <a href="tel:+2349029004712" className="text-blue-600 text-xs font-bold hover:underline">Call: (+234) 902-900-4712</a>
                <a href="https://wa.me/2349029004712" target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-xs font-bold hover:underline">WhatsApp</a>
                <a href="mailto:support@glotrade.online" className="text-neutral-600 dark:text-neutral-400 text-xs font-bold hover:underline">support@glotrade.online</a>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {status === "needs-auth" ? (
              <button onClick={goLogin} className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95">OK, sign in</button>
            ) : (
              <button onClick={() => router.replace("/")} className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95">Go to Homepage</button>
            )}
            <button onClick={() => router.replace(cancelRedirect)} className="flex-1 rounded-full border px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}
