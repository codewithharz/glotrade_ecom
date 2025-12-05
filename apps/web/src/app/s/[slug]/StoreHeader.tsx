"use client";
import { useRouter } from "next/navigation";
import { apiPost } from "@/utils/api";
import { useEffect, useMemo, useState } from "react";
import {  StoreIcon } from "lucide-react";
import Link from "next/link";

type SellerHeaderData = {
  name?: string;
  soldCount?: number;
  itemsCount?: number;
  followers?: Array<string | { _id: string } | number>;
  logoUrl?: string;
  description?: string;
  // New metrics (revenue kept private)
  averageRating?: number;
  totalViews?: number;
  activeSince?: string;
  totalProducts?: number;
};

export default function StoreHeader({ slug, seller, itemsCount }: { slug: string; seller: SellerHeaderData; itemsCount?: number }) {
  const followersCount = Array.isArray(seller?.followers) ? (seller.followers as unknown[]).length : 0;
  const name = seller?.name || slug;
  const soldCount = typeof seller?.soldCount === "number" ? seller.soldCount : 0;
  const totalItems = typeof itemsCount === "number" ? itemsCount : (typeof seller?.itemsCount === "number" ? seller.itemsCount : 0);

  const formatCompact = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
    return String(n);
  };
  function readAuth() {
    try {
      const raw = localStorage.getItem("afritrade:user") || localStorage.getItem("user");
      const me = raw ? JSON.parse(raw) : null;
      const uid = me?._id || me?.id || me?.userId || me?.user?.id || me?.user?._id;
      // Treat presence of a user id as authenticated, since backend accepts Bearer <id>
      return { isAuthed: Boolean(uid), uid } as const;
    } catch { return { isAuthed: false, uid: undefined } as const; }
  }
  // Important: avoid reading window/localStorage during first render to prevent hydration mismatch
  const [auth, setAuth] = useState<{ isAuthed: boolean; uid?: string }>({ isAuthed: false, uid: undefined });
  const [state, setState] = useState<{ following?: boolean; count: number }>({ count: followersCount, following: undefined });
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      const a = readAuth();
      setAuth(a);
      if (Array.isArray(seller?.followers)) {
        const extractId = (f: string | { _id: string } | number) => (typeof f === 'string' || typeof f === 'number' ? String(f) : String(f?._id));
        const f = a.uid ? seller.followers.some((x) => extractId(x) === String(a.uid)) : false;
        setState((s) => ({ ...s, following: f }));
      } else {
        setState((s) => ({ ...s, following: false }));
      }
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('auth:update', refresh as EventListener);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('auth:update', refresh as EventListener);
    };
  }, [seller]);

  const toggling = state.following === undefined;
  const onToggle = async () => {
    if (state.following === undefined) return;
    if (!auth.isAuthed) { setShowAuth(true); return; }
    setState((s) => ({ ...s, following: !s.following, count: s.count + (s.following ? -1 : 1) }));
    try {
      const path = state.following
        ? `/api/v1/sellers/${encodeURIComponent(slug)}/unfollow`
        : `/api/v1/sellers/${encodeURIComponent(slug)}/follow`;
      const r = await apiPost<{ status: string; data: { following: boolean; followersCount: number } }>(
        path,
        {}
      );
      if (r?.data) setState({ following: r.data.following, count: r.data.followersCount });
    } catch {
      setState((s) => ({ ...s, following: !s.following, count: s.count + (s.following ? -1 : 1) }));
    }
  };

  return (
    <>
      <div className="px-4 md:px-8 pt-6 md:pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
          {/* Store Info - Left Side */}
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-3">
            {/* Logo - Clickable to About page */}
            <Link href={`/s/${slug}/about`} className="hover:opacity-80 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={seller?.logoUrl || 'https://picsum.photos/seed/mba-m2-1/800/800'}
                alt="avatar"
                className="h-16 w-16 md:h-14 md:w-14 rounded-full object-cover shadow cursor-pointer"
              />
            </Link>
            <div className="text-center md:text-left">
              {/* Store Name - Clickable to About page */}
              <Link href={`/s/${slug}/about`} className="hover:underline hover:text-neutral-700 transition-colors">
                <div className="text-xl md:text-lg font-semibold text-neutral-900 cursor-pointer">
                  {seller?.name || slug}
                </div>
              </Link>
              <div className="text-sm text-neutral-600 mt-1">{seller?.description || 'Store description'}</div>
            </div>
          </div>

          {/* Metrics and Follow Button - Right Side */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:max-w-[600px]">
            {/* Metrics Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 w-full text-center bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 md:p-4">
              {/* Row 1: Followers, Sold, Items */}
              <div>
                <div className="text-base md:text-lg font-semibold text-neutral-900">{formatCompact(state.count)}</div>
                <div className="text-xs md:text-sm text-neutral-600">Followers</div>
              </div>
              <div>
                <div className="text-base md:text-lg font-semibold text-neutral-900">{formatCompact(soldCount)}</div>
                <div className="text-xs md:text-sm text-neutral-600">Sold</div>
              </div>
              <div>
                <div className="text-base md:text-lg font-semibold text-neutral-900">{formatCompact(totalItems)}</div>
                <div className="text-xs md:text-sm text-neutral-600">Items</div>
              </div>
              
              {/* Row 2: Rating, Views, Since (hidden on mobile) */}
              <div className="hidden md:block">
                <div className="text-lg font-semibold text-neutral-900">{seller?.averageRating ? seller.averageRating.toFixed(1) : '0.0'}</div>
                <div className="text-sm text-neutral-600">Rating</div>
              </div>
              <div className="hidden md:block">
                <div className="text-lg font-semibold text-neutral-900">{seller?.totalViews ? formatCompact(seller.totalViews) : '0'}</div>
                <div className="text-sm text-neutral-600">Views</div>
              </div>
              <div className="hidden md:block">
                <div className="text-lg font-semibold text-neutral-900">{seller?.activeSince ? new Date(seller.activeSince).getFullYear() : 'N/A'}</div>
                <div className="text-sm text-neutral-600">Since</div>
              </div>
            </div>
            
            {/* Follow Button */}
            <button
              onClick={onToggle}
              disabled={toggling}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 disabled:opacity-60"
            >
              <StoreIcon className="h-5 w-5" />
              {state.following ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      {showAuth ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAuth(false)} />
          <div className="relative w-[92%] max-w-md rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-900 shadow-2xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
            <div className="mb-1 text-lg font-semibold">Sign in required</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">Please sign in to follow this store.</div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const next = typeof window !== 'undefined' ? window.location.pathname + window.location.search : `/s/${slug}`;
                  router.push(`/auth/login?next=${encodeURIComponent(next)}`);
                }}
                className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
              >
                OK, sign in
              </button>
              <button onClick={() => setShowAuth(false)} className="flex-1 rounded-full border px-4 py-2 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  /* Auth modal rendered below */
}

// Render login modal at the end of component to avoid layout shift
// We keep it after the header markup for clarity
// eslint-disable-next-line @next/next/no-img-element


