"use client";
import { useEffect, useMemo, useState } from "react";

type ToastMsg = { id: number; type: "success" | "error" | "info" | "warning"; title?: string; text: string; duration?: number };

export function toast(text: string, type: ToastMsg["type"] = "info", opts?: { title?: string; duration?: number }) {
  try { window.dispatchEvent(new CustomEvent("toast:show", { detail: { type, text, title: opts?.title, duration: opts?.duration } })); } catch {}
}

const typeStyles: Record<ToastMsg["type"], string> = {
  success: "bg-emerald-600/90 text-white",
  error: "bg-rose-600/90 text-white",
  info: "bg-neutral-900/90 text-white",
  warning: "bg-amber-500/90 text-white",
};

function ProgressBar({ duration = 3200 }: { duration?: number }) {
  const [percent, setPercent] = useState(100);
  useEffect(() => {
    const started = Date.now();
    const total = duration;
    const t = setInterval(() => {
      const elapsed = Date.now() - started;
      const left = Math.max(0, total - elapsed);
      setPercent((left / total) * 100);
      if (left <= 0) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [duration]);
  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/25">
      <div className="h-full rounded-full bg-white transition-[width]" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function ToastHost() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    const onShow = (e: Event) => {
      const { text, type, title, duration } = (e as CustomEvent).detail || {};
      const id = Date.now() + Math.random();
      const dur = typeof duration === "number" ? duration : 3500;
      setItems((prev) => [...prev, { id, type, text, title, duration: dur }]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), dur);
    };
    window.addEventListener("toast:show", onShow as EventListener);
    return () => window.removeEventListener("toast:show", onShow as EventListener);
  }, []);

  const containerClass = useMemo(() => "pointer-events-none fixed bottom-3 right-3 z-[60] flex w-auto max-w-[92vw] flex-col items-end gap-2 sm:bottom-6 sm:right-6", []);

  return (
    <div className={containerClass}>
      {items.map((i) => (
        <div key={i.id} className={`pointer-events-auto min-w-64 max-w-[92vw] sm:max-w-[360px] rounded-xl px-4 py-3 text-sm shadow-2xl ring-1 ring-black/5 backdrop-blur-md ${typeStyles[i.type]}`}>
          {i.title ? <div className="mb-0.5 text-[13px] font-semibold opacity-90">{i.title}</div> : null}
          <div>{i.text}</div>
          <ProgressBar duration={i.duration} />
        </div>
      ))}
    </div>
  );
}

