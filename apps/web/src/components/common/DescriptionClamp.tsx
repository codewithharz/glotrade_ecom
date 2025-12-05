"use client";
import { useState } from "react";

export default function DescriptionClamp({ text, clampLines = 2 }: { text: string; clampLines?: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* Mobile: clamped with toggle */}
      <div className="md:hidden">
        {expanded ? (
          <p className="text-base text-neutral-700 dark:text-neutral-300 leading-7 whitespace-pre-line">
            {text}
          </p>
        ) : (
          <p
            className="text-base text-neutral-700 dark:text-neutral-300 leading-7 whitespace-pre-line overflow-hidden [display:-webkit-box] [word-break:break-word] [text-overflow:ellipsis]"
            style={{ WebkitLineClamp: clampLines, WebkitBoxOrient: "vertical" as const }}
          >
            {text}
          </p>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold text-neutral-700 underline"
        >
          {expanded ? "View less" : "View more"}
        </button>
      </div>

      {/* Desktop: full text, no toggle */}
      <p className="hidden md:block text-base text-neutral-700 dark:text-neutral-300 leading-7 whitespace-pre-line">
        {text}
      </p>
    </div>
  );
}

