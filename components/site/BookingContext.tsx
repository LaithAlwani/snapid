"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import type { Counts, Deliverable, Place, DocType, Tier } from "@/lib/pricing";

export type BookingForm = {
  name: string;
  phone: string;
  email: string;
  country: string;
  docType: DocType;
  counts: Counts;
  deliverable: Deliverable;
  place: Place;
  address: string;
  notes: string;
};

const DEFAULT_FORM: BookingForm = {
  name: "",
  phone: "",
  email: "",
  country: "",
  docType: "Passport",
  counts: { adult: 1, child: 0, toddler: 0, baby: 0 },
  deliverable: "print",
  place: "studio",
  address: "",
  notes: "",
};

type Ctx = {
  form: BookingForm;
  setField: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  setCount: (tier: Tier, value: number) => void;
  prefill: (data: Record<string, unknown>) => void;
  reset: () => void;
};

const BookingCtx = createContext<Ctx | null>(null);

const SCALAR_KEYS = new Set<keyof BookingForm>([
  "name",
  "phone",
  "email",
  "country",
  "docType",
  "deliverable",
  "place",
  "address",
  "notes",
]);
const TIER_KEYS: Tier[] = ["adult", "child", "toddler", "baby"];

export function BookingProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<BookingForm>(DEFAULT_FORM);

  const setField = useCallback(
    <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
    },
    [],
  );

  const setCount = useCallback((tier: Tier, value: number) => {
    setForm((f) => ({
      ...f,
      counts: { ...f.counts, [tier]: Math.max(0, Math.min(20, Math.floor(value) || 0)) },
    }));
  }, []);

  // Merge whatever the assistant sends, ignoring empty/unknown keys.
  const prefill = useCallback((data: Record<string, unknown>) => {
    setForm((f) => {
      const next: BookingForm = { ...f, counts: { ...f.counts } };
      for (const [k, val] of Object.entries(data)) {
        if (val === undefined || val === null || val === "") continue;
        if (k === "counts" && typeof val === "object") {
          const c = val as Record<string, unknown>;
          for (const tier of TIER_KEYS) {
            const n = Number(c[tier]);
            if (!Number.isNaN(n)) next.counts[tier] = Math.max(0, Math.min(20, Math.floor(n)));
          }
        } else if (SCALAR_KEYS.has(k as keyof BookingForm)) {
          (next as Record<string, unknown>)[k] = val;
        }
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => setForm(DEFAULT_FORM), []);

  return (
    <BookingCtx.Provider value={{ form, setField, setCount, prefill, reset }}>
      {children}
    </BookingCtx.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
