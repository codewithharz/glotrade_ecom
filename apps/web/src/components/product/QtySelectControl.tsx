"use client";
import { useEffect, useState } from "react";

type Props = {
  productId: string;
  className?: string;
  minQty?: number;
  maxQty?: number;
};

function readCart(): string[] {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

// No write here – Qty select shouldn't commit to cart. AddToCartControl is responsible for writing.

export default function QtySelectControl({ productId, className, minQty = 1, maxQty = 5 }: Props) {
  const [qty, setQty] = useState<number>(0);
  const MIN_QTY = Math.max(1, Number(minQty));
  const MAX_QTY = Math.max(MIN_QTY, Number(maxQty));

  // Initialize and subscribe to external qty changes
  useEffect(() => {
    const cart = readCart();
    setQty(cart.filter((id) => id === productId).length);
    const onQty = (e: Event) => {
      const detail = (e as CustomEvent).detail as { productId: string; qty: number };
      if (detail.productId === productId) setQty(detail.qty);
    };
    const onPending = (e: Event) => {
      const detail = (e as CustomEvent).detail as { productId: string; qty: number };
      if (detail.productId === productId) setQty(detail.qty);
    };
    window.addEventListener("cart:qty", onQty as EventListener);
    window.addEventListener("cart:pendingQty", onPending as EventListener);
    return () => {
      window.removeEventListener("cart:qty", onQty as EventListener);
      window.removeEventListener("cart:pendingQty", onPending as EventListener);
    };
  }, [productId]);

  const setQuantity = (nextQty: number) => {
    const bounded = Math.max(MIN_QTY, Math.min(MAX_QTY, nextQty));
    setQty(bounded);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart:pendingQty", { detail: { productId, qty: bounded } }));
    }
  };

  if (MAX_QTY <= 0) {
    return <div className="text-sm text-rose-600">Out of stock</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className={className}
        value={qty === 0 ? MIN_QTY : qty}
        onChange={(e) => setQuantity(Number(e.currentTarget.value))}
      >
        {Array.from({ length: MAX_QTY - MIN_QTY + 1 }, (_, i) => i + MIN_QTY).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <span className="text-sm text-neutral-500">Added</span>
    </div>
  );
}

