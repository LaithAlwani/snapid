"use client";

import { useState } from "react";
import { FAQS } from "@/lib/site-data";

export function Faq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-[820px] px-[18px] py-16">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
          FAQ
        </h2>
        <div className="mt-6 grid gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-hairline bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex min-h-[56px] w-full items-center justify-between gap-3.5 px-5 py-[18px] text-left font-heading text-[16.5px] font-semibold text-heading hover:bg-surface-2"
                  aria-expanded={isOpen}
                >
                  <span>{f.q}</span>
                  <span className="text-[20px] leading-none text-brand">
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-base leading-[1.6] text-muted">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
