"use client";

import { ReactNode, useEffect } from "react";

export function Dialog({
  open,
  title,
  children,
  onClose,
  tone = "neutral",
  actions,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  onClose: () => void;
  tone?: "neutral" | "error" | "success";
  actions?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const accent =
    tone === "error"
      ? "text-red-600"
      : tone === "success"
        ? "text-emerald-600"
        : "text-brand";

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="animate-pop w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`font-heading text-[20px] font-extrabold ${accent}`}>
          {title}
        </h3>
        {children && (
          <div className="mt-2 text-[15px] leading-[1.55] text-heading">
            {children}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          {actions ?? (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] rounded-full bg-navy px-5 font-semibold text-white hover:bg-brand"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Inline, non-blocking error banner for form validation feedback. */
export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
    >
      {message}
    </div>
  );
}
