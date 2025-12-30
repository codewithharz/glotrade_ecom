"use client";
import Link from "next/link";

import { translate, Locale } from "@/utils/i18n";

export default function DesktopQuickChips({ params, basePath = "/marketplace", locale }: { params: Record<string, string>; basePath?: string; locale: Locale }) {
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

  const base = basePath;

  const sort = params["sort"];
  const freeShipping = params["freeShipping"] === "true";
  const verifiedSeller = params["verifiedSeller"] === "true";
  const discountMin = params["discountMin"] || "";

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ` +
    (active
      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black"
      : "border-neutral-300 dark:border-neutral-700");

  return (
    <div className="hidden lg:flex items-center gap-2 mb-4">
      <Link href={withParams(base, params, { sort: "-views" })} className={chip(sort === "-views")}>{translate(locale, "market.sortPopular")}</Link>
      <Link href={withParams(base, params, { sort: "price" })} className={chip(sort === "price")}>{translate(locale, "market.sortPriceLowHigh")}</Link>
      <Link href={withParams(base, params, { sort: "-price" })} className={chip(sort === "-price")}>{translate(locale, "market.sortPriceHighLow")}</Link>
      <Link href={withParams(base, params, { sort: "-createdAt" })} className={chip(sort === "-createdAt")}>{translate(locale, "market.sortNewest")}</Link>
      <span className="mx-2 h-5 w-px bg-neutral-200 dark:bg-neutral-800" />
      <Link href={withParams(base, params, { freeShipping: (!freeShipping).toString() })} className={chip(freeShipping)}>{translate(locale, "market.filterFreeShipping")}</Link>
      <Link href={withParams(base, params, { verifiedSeller: (!verifiedSeller).toString() })} className={chip(verifiedSeller)}>{translate(locale, "market.filterVerified")}</Link>
      <Link href={withParams(base, params, { discountMin: discountMin === "20" ? undefined : 20 })} className={chip(discountMin === "20")}>{translate(locale, "market.discount20Off")}</Link>
    </div>
  );
}

