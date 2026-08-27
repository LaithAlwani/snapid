"use client";

import { useCallback, useEffect, useRef, useState, ReactNode } from "react";

/**
 * Horizontal scroll container with a hidden native scrollbar and, on desktop,
 * left/right arrow buttons that appear only when there's more to scroll.
 * On touch/mobile the arrows are hidden and users swipe.
 */
export function HScroll({
  children,
  className = "",
  amount = 220,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const nudge = (dir: number) =>
    ref.current?.scrollBy({ left: dir * amount, behavior: "smooth" });

  return (
    <div className="group relative">
      <div ref={ref} className={`no-scrollbar overflow-x-auto ${className}`}>
        {children}
      </div>

      {canLeft && (
        <Arrow side="left" onClick={() => nudge(-1)} />
      )}
      {canRight && (
        <Arrow side="right" onClick={() => nudge(1)} />
      )}
    </div>
  );
}

function Arrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Scroll left" : "Scroll right"}
      onClick={onClick}
      className={`absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-hairline bg-white text-heading shadow-md transition-colors hover:bg-surface md:grid ${
        side === "left" ? "left-1" : "right-1"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {side === "left" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );
}
