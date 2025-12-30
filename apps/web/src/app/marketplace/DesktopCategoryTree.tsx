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

export default function DesktopCategoryTree({
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
  const base = basePath;
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

  const bySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c] as const)), [categories]);
  const byName = useMemo(() => new Map(categories.map((c) => [c.name, c] as const)), [categories]);
  const selectedCat = selectedCategoryName ? byName.get(selectedCategoryName) : undefined;

  const selectedPathTopSlug = useMemo(() => {
    if (!selectedCat) return undefined;
    const l2 = bySlug.get(selectedCat.parentId || "");
    const l1 = l2 ? bySlug.get(l2.parentId || "") : undefined;
    return l1?.slug;
  }, [selectedCat, bySlug]);

  const [openL1, setOpenL1] = useState<string | undefined>(selectedPathTopSlug);

  return (
    <div className="space-y-6">
      <div className="text-sm font-semibold mb-1">{translate(locale, "market.categories")}</div>
      <Link
        href={withParams(base, params, { category: undefined })}
        className={`block text-sm px-2 py-1 rounded ${!selectedCategoryName
            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black"
            : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
          }`}
      >
        {translate(locale, "market.all")}
      </Link>

      {level1.map((l1) => (
        <details
          key={l1._id}
          open={openL1 === l1.slug}
          onToggle={(e) => {
            // ensure accordion behavior: only one open at a time
            const el = e.currentTarget as HTMLDetailsElement;
            if (el.open) setOpenL1(l1.slug);
            else if (openL1 === l1.slug) setOpenL1(undefined);
          }}
        >
          <summary className="cursor-pointer text-sm font-medium px-2 py-1 list-none flex items-center gap-2">
            <span>▸</span>
            {l1.name}
          </summary>
          <div className="ml-3 pl-2 border-l border-neutral-200 dark:border-neutral-800 space-y-1">
            {(childrenMap[l1.slug] || []).map((l2) => (
              <details key={l2._id}>
                <summary className="cursor-pointer text-sm px-2 py-1 list-none flex items-center gap-2">
                  <span>▸</span>
                  {l2.name}
                </summary>
                <div className="ml-3 pl-2 border-l border-neutral-200 dark:border-neutral-800">
                  {(childrenMap[l2.slug] || []).map((l3) => (
                    <Link
                      key={l3._id}
                      href={withParams(base, params, { category: l3.name })}
                      className={`block text-sm px-2 py-1 rounded ${selectedCategoryName === l3.name
                          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                        }`}
                    >
                      {l3.name}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

