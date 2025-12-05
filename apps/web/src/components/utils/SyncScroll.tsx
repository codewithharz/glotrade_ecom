"use client";
import { useEffect } from "react";

export default function SyncScroll({ leftId, rightId, bottomAlignTargetId, offset = 0, mode = "align", containerId }: { leftId: string; rightId: string; bottomAlignTargetId?: string; offset?: number; mode?: "align" | "full"; containerId?: string }) {
  useEffect(() => {
    const left = document.getElementById(leftId);
    const right = document.getElementById(rightId);
    const container = containerId ? document.getElementById(containerId) : null;
    if (!left || !right) return;
    const target = bottomAlignTargetId ? document.getElementById(bottomAlignTargetId) : null;

    const getRelativeTop = (el: HTMLElement, ancestor: HTMLElement): number => {
      let y = 0;
      let node: HTMLElement | null = el;
      while (node && node !== ancestor) {
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return y;
    };

    const computeMaxTop = () => {
      const naturalMax = Math.max(0, left.scrollHeight - left.clientHeight);
      if (mode === "full") return naturalMax;
      const rightHeight = right.clientHeight;
      // Ensure we can scroll until the left content bottom meets the right bottom
      const alignByRight = Math.max(0, left.scrollHeight - rightHeight + offset);
      let alignByTarget = 0;
      if (target) {
        const rectTop = getRelativeTop(target, left);
        alignByTarget = Math.max(0, rectTop + target.offsetHeight - rightHeight + offset);
      }
      const desiredMax = Math.max(alignByRight, alignByTarget);
      return Math.min(naturalMax, desiredMax);
    };

    const onWheel = (e: WheelEvent) => {
      // Forward wheel scroll on the right section to the left scroll container
      const maxTop = computeMaxTop();
      const atTop = left.scrollTop <= 0;
      const atBottom = left.scrollTop >= maxTop - 1;
      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      // If we're at a boundary and user scrolls beyond, allow page to take over
      if ((atBottom && scrollingDown) || (atTop && scrollingUp)) {
        return; // do not preventDefault → bubble to page
      }

      e.preventDefault();
      const next = Math.min(maxTop, Math.max(0, left.scrollTop + e.deltaY));
      left.scrollTop = next;
    };

    // Touch support (trackpads/mobiles)
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY || 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0]?.clientY || 0;
      const deltaY = touchStartY - currentY;
      if (Math.abs(deltaY) === 0) return;
      const maxTop = computeMaxTop();
      const atTop = left.scrollTop <= 0;
      const atBottom = left.scrollTop >= maxTop - 1;
      const scrollingDown = deltaY > 0;
      const scrollingUp = deltaY < 0;

      // Let page scroll if at boundaries
      if ((atBottom && scrollingDown) || (atTop && scrollingUp)) {
        return;
      }

      e.preventDefault();
      left.scrollTop = Math.min(maxTop, Math.max(0, left.scrollTop + deltaY));
      touchStartY = currentY;
    };

    // Keyboard (arrow/PageUp/PageDown) when right has focus
    const onKeyDown = (e: KeyboardEvent) => {
      const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"] as const;
      if (!keys.includes(e.key as typeof keys[number])) return;
      const view = left.clientHeight;
      const maxTop = computeMaxTop();
      const atTop = left.scrollTop <= 0;
      const atBottom = left.scrollTop >= maxTop - 1;
      switch (e.key) {
        case "ArrowDown":
          if (atBottom) return; e.preventDefault(); left.scrollTop = Math.min(maxTop, left.scrollTop + 40); break;
        case "ArrowUp":
          if (atTop) return; e.preventDefault(); left.scrollTop = Math.max(0, left.scrollTop - 40); break;
        case "PageDown":
          if (atBottom) return; e.preventDefault(); left.scrollTop = Math.min(maxTop, left.scrollTop + view); break;
        case "PageUp":
          if (atTop) return; e.preventDefault(); left.scrollTop = Math.max(0, left.scrollTop - view); break;
        case "Home":
          if (atTop) return; e.preventDefault(); left.scrollTop = 0; break;
        case "End":
          if (atBottom) return; e.preventDefault(); left.scrollTop = maxTop; break;
      }
    };

    // Bind to right; additionally bind to container to capture wheel anywhere in the two-column viewport
    right.addEventListener("wheel", onWheel, { passive: false });
    right.addEventListener("touchstart", onTouchStart, { passive: true });
    right.addEventListener("touchmove", onTouchMove, { passive: false });
    if (container) {
      container.addEventListener("wheel", onWheel, { passive: false });
      container.addEventListener("touchstart", onTouchStart, { passive: true });
      container.addEventListener("touchmove", onTouchMove, { passive: false });
    }
    right.addEventListener("keydown", onKeyDown as EventListener);

    const onResize = () => {
      // recompute to keep alignment after layout changes
      computeMaxTop();
    };
    window.addEventListener("resize", onResize);

    // Observe size changes within left to keep alignment accurate (e.g., when clicking See more)
    const mo = new MutationObserver(() => {
      // noop: computeMaxTop is called on next scroll; we could proactively clamp
      const maxTop = computeMaxTop();
      if (left.scrollTop > maxTop) left.scrollTop = maxTop;
    });
    mo.observe(left, { childList: true, subtree: true });

    return () => {
      right.removeEventListener("wheel", onWheel as EventListener);
      right.removeEventListener("touchstart", onTouchStart as EventListener);
      right.removeEventListener("touchmove", onTouchMove as EventListener);
      right.removeEventListener("keydown", onKeyDown as EventListener);
      if (container) {
        container.removeEventListener("wheel", onWheel as EventListener);
        container.removeEventListener("touchstart", onTouchStart as EventListener);
        container.removeEventListener("touchmove", onTouchMove as EventListener);
      }
      window.removeEventListener("resize", onResize as EventListener);
      mo.disconnect();
    };
  }, [leftId, rightId, bottomAlignTargetId, offset, mode, containerId]);

  return null;
}

