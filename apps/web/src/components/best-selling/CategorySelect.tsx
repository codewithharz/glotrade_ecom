"use client";
import { useRouter } from "next/navigation";

export default function CategorySelect({ current, days, options }: { current: string; days: string; options: string[] }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <span className="text-sm text-neutral-500 whitespace-nowrap">Filter by category</span>
      <div className="relative">
        <select
          defaultValue={current}
          onChange={(e) => {
            const val = e.currentTarget.value;
            const url = val === "Recommended" ? `/best-selling?days=${days}` : `/best-selling?days=${days}&category=${encodeURIComponent(val)}`;
            router.push(url);
          }}
          className="appearance-none pl-4 pr-10 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm bg-white dark:bg-neutral-900"
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600">▾</span>
      </div>
      {current !== "Recommended" ? (
        <button
          type="button"
          onClick={() => router.push(`/best-selling?days=${days}`)}
          className="text-sm text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white underline whitespace-nowrap"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}

