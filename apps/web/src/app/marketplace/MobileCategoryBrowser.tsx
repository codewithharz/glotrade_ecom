"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

import { translate, Locale } from "@/utils/i18n";

type Category = { _id: string; name: string; slug: string; parentId?: string };

function withParams(
  basePath: string,
  params: Record<string, string>,
  updates: Record<string, string | number | undefined>
) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  Object.entries(updates).forEach(([k, v]) => {
    if (v === undefined || v === "") sp.delete(k);
    else sp.set(k, String(v));
  });
  const query = sp.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function MobileCategoryBrowser({
  categories,
  params,
  selectedCategoryName,
  basePath = "/marketplace",
  locale
}: {
  categories: Category[];
  params: Record<string, string>;
  selectedCategoryName?: string;
  basePath?: string;
  locale: Locale;
}) {
  const level1 = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const childrenMap = useMemo(() => {
    const map: Record<string, Category[]> = {};
    categories.forEach((c) => {
      if (c.parentId) {
        map[c.parentId] = map[c.parentId] || [];
        map[c.parentId].push(c);
      }
    });
    return map;
  }, [categories]);

  // Initialize from selected leaf if present, else show only level 1
  const selectedLeaf = useMemo(
    () => categories.find((c) => c.name === selectedCategoryName),
    [categories, selectedCategoryName]
  );
  const initialL1 = useMemo(() => {
    if (!selectedLeaf) return undefined;
    // find chain up to root using parentId=slug pointers
    const l2Candidate = categories.find((c) => c.slug === selectedLeaf.parentId);
    if (!l2Candidate) return undefined;
    const l1Candidate = categories.find((c) => c.slug === l2Candidate.parentId);
    return l1Candidate;
  }, [categories, selectedLeaf]);
  const initialL2 = useMemo(() => {
    if (!selectedLeaf) return undefined;
    return categories.find((c) => c.slug === selectedLeaf.parentId);
  }, [categories, selectedLeaf]);

  const [l1, setL1] = useState<Category | undefined>(initialL1);
  const level2 = l1 ? childrenMap[l1.slug] || [] : [];
  const [l2, setL2] = useState<Category | undefined>(initialL2);
  const level3 = l2 ? childrenMap[l2.slug] || [] : [];

  // Basic drag-to-scroll for mouse; touch scroll works by default
  const enableDragScroll = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const startX = e.pageX - el.offsetLeft;
    const scrollLeft = el.scrollLeft;
    const onMove = (ev: MouseEvent) => {
      const x = ev.pageX - el.offsetLeft;
      const walk = x - startX;
      el.scrollLeft = scrollLeft - walk;
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ${active
      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black"
      : "border-neutral-300 dark:border-neutral-700"
    }`;

  return (
    <div className="space-y-3">
      {/* Level 1 */}
      <div
        className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
        onMouseDown={enableDragScroll}
      >
        <Link
          href={withParams(basePath, params, { category: undefined })}
          className={pill(!selectedCategoryName)}
          onClick={() => { setL1(undefined); setL2(undefined); }}
        >
          {translate(locale, "market.all")}
        </Link>
        {level1.map((c) => (
          <button key={c._id} onClick={() => { setL1(c); setL2(undefined); }} className={pill(l1?.slug === c.slug)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Level 2 */}
      {l1 && level2.length > 0 ? (
        <div
          className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
          onMouseDown={enableDragScroll}
        >
          <Link
            href={withParams(basePath, params, { category: undefined })}
            className={pill(!selectedCategoryName)}
            onClick={() => { setL2(undefined); }}
          >
            {translate(locale, "market.all")}
          </Link>
          {level2.map((c) => (
            <button key={c._id} onClick={() => setL2(c)} className={pill(l2?.slug === c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
      ) : null}

      {/* Level 3 */}
      {l2 && level3.length > 0 ? (
        <div
          className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
          onMouseDown={enableDragScroll}
        >
          <Link
            href={withParams(basePath, params, { category: undefined })}
            className={pill(!selectedCategoryName)}
          >
            {translate(locale, "market.all")}
          </Link>
          {level3.map((c) => (
            <Link
              key={c._id}
              href={withParams(basePath, params, { category: c.name })}
              className={pill(selectedCategoryName === c.name)}
            >
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

