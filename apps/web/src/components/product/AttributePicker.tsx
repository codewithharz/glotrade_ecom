"use client";
import { useEffect, useMemo, useState } from "react";

type Props = {
  productId: string;
  attributes?: Record<string, string | string[]>;
};

function colorSwatch(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("black")) return "#111827";
  if (n.includes("white")) return "#e5e7eb";
  if (n.includes("gray") || n.includes("grey")) return "#9ca3af";
  if (n.includes("blue")) return "#3b82f6";
  if (n.includes("red")) return "#ef4444";
  if (n.includes("green")) return "#10b981";
  if (n.includes("yellow")) return "#f59e0b";
  if (n.includes("purple")) return "#8b5cf6";
  if (n.includes("orange")) return "#f97316";
  return "#9ca3af";
}

export default function AttributePicker({ productId, attributes }: Props) {
  const data = useMemo(() => {
    const map: Record<string, string[]> = {};
    if (!attributes) return map;
    Object.entries(attributes).forEach(([key, value]) => {
      const arr = Array.isArray(value) ? value : [value];
      map[key] = arr.map((v) => String(v));
    });
    return map;
  }, [attributes]);

  const initial: Record<string, string> = useMemo(() => {
    const obj: Record<string, string> = {};
    Object.entries(data).forEach(([key, values]) => {
      if (values.length > 0) obj[key] = values[0];
    });
    return obj;
  }, [data]);

  const [selected, setSelected] = useState<Record<string, string>>(initial);

  useEffect(() => {
    setSelected(initial);
  }, [initial]);

  useEffect(() => {
    const label = Object.entries(selected)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("product:variantLabel", {
            detail: { productId, label },
          })
        );
      }
    } catch {}
  }, [productId, selected]);

  if (!attributes || Object.keys(data).length === 0) return null;

  return (
    <div>
      <h3 className="text-sm sm:text-base font-semibold mb-2">Attributes</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, values]) => {
          const isColor = key.toLowerCase() === "color";
          const current = selected[key];
          return (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="w-12 text-black font-semibold">{key}</span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {values.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm transition ${
                      current === v
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-200 dark:bg-neutral-200 dark:text-black"
                        : "border-neutral-300 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-600"
                    }`}
                    onClick={() => setSelected((s) => ({ ...s, [key]: v }))}
                    aria-pressed={current === v}
                  >
                    {isColor ? (
                      <span
                        className="h-3 w-3 sm:h-4 sm:w-4 inline-block rounded-full border border-neutral-300"
                        style={{ backgroundColor: colorSwatch(v) }}
                      />
                    ) : null}
                    <span>{v}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

