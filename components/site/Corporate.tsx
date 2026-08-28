"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, ErrorBanner } from "./Dialog";

const fieldLabel = "grid gap-1.5 text-sm font-semibold text-heading";
const control =
  "min-h-[46px] w-full rounded-[10px] border border-hairline-strong bg-white px-[13px] py-3 focus:border-brand focus:outline-none";

const CARDS = [
  {
    title: "Employee headshots",
    body: "One lighting setup, one background, everyone matching. Files delivered web-ready for your site and LinkedIn.",
  },
  {
    title: "Passport photo day",
    body: "Staff and their families get passport, visa or PR photos on site — cropped to each destination country's spec, no one taking an afternoon off.",
  },
  {
    title: "Priced per visit",
    body: "Half-day and full-day rates depending on head count and travel. Tell us the size of the group and we'll send a quote.",
  },
];

type Service = "headshots" | "passportDay" | "both";

const SERVICES: Array<{ value: Service; label: string }> = [
  { value: "headshots", label: "Employee headshots" },
  { value: "passportDay", label: "Passport photo day" },
  { value: "both", label: "Both" },
];

const EMPTY = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  // Held as a string: an <input type="number"> bound to number state gives an
  // unusable empty/NaN dance. Parsed once, at submit.
  employees: "",
  service: "headshots" as Service,
  location: "",
  timing: "",
  notes: "",
};

export function Corporate() {
  const submit = useMutation(api.corporate.submitLead);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [v, setV] = useState(EMPTY);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !v.company.trim() ||
      !v.contactName.trim() ||
      !v.email.trim() ||
      !v.location.trim()
    ) {
      setError("Please fill in company, your name, work email and location.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) {
      setError("Please enter a valid work email.");
      return;
    }
    const employees = Number(v.employees.trim());
    if (!/^\d+$/.test(v.employees.trim()) || employees < 1 || employees > 5000) {
      setError("Roughly how many employees? Enter a number between 1 and 5000.");
      return;
    }

    setBusy(true);
    try {
      await submit({
        company: v.company,
        contactName: v.contactName,
        email: v.email,
        phone: v.phone.trim() || undefined,
        employees,
        service: v.service,
        location: v.location,
        timing: v.timing.trim() || undefined,
        notes: v.notes.trim() || undefined,
      });
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="corporate" className="border-t border-hairline bg-surface">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-[34px] px-[18px] py-16 md:grid-cols-2">
        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
            Corporate &amp; teams
          </h2>
          <p className="mt-3 max-w-[24ch] font-heading text-[28px] font-bold leading-[1.2]">
            We bring the studio to your office.
          </p>
          <p className="mt-4 max-w-[46ch] text-[16.5px] leading-[1.55] text-muted">
            Consistent headshots for the whole team, or a passport photo day for
            staff and their families. We set up in a boardroom or a corner of
            the office and work through your list.
          </p>

          <div className="mt-8 grid gap-[18px]">
            {CARDS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-hairline bg-white p-[22px]"
              >
                <h3 className="text-[17px] font-bold text-heading">{c.title}</h3>
                <p className="mt-2 text-[15.5px] leading-[1.55] text-muted">
                  {c.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[15.5px] text-muted">
            Ottawa and surrounding communities. Usually quoted within one
            business day.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="h-fit rounded-2xl border border-hairline bg-white p-[22px]"
        >
          {sent ? (
            <div className="animate-pop py-5">
              <div className="font-heading text-[22px] font-extrabold text-heading">
                Request received
              </div>
              <p className="mt-2.5 text-base leading-[1.55] text-muted">
                Thanks — we&rsquo;ll email a quote for {v.company} within one
                business day. If it&rsquo;s urgent, call (613) 000-0000.
              </p>
            </div>
          ) : (
            <div className="grid gap-3.5">
              <label className={fieldLabel}>
                Company
                <input
                  type="text"
                  required
                  value={v.company}
                  onChange={(e) => setV({ ...v, company: e.target.value })}
                  placeholder="Acme Inc."
                  className={control}
                />
              </label>
              <label className={fieldLabel}>
                Your name
                <input
                  type="text"
                  required
                  value={v.contactName}
                  onChange={(e) => setV({ ...v, contactName: e.target.value })}
                  className={control}
                />
              </label>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <label className={fieldLabel}>
                  Work email
                  <input
                    type="email"
                    required
                    value={v.email}
                    onChange={(e) => setV({ ...v, email: e.target.value })}
                    className={control}
                  />
                </label>
                <label className={fieldLabel}>
                  <span>
                    Phone{" "}
                    <span className="font-normal text-muted">(optional)</span>
                  </span>
                  <input
                    type="tel"
                    value={v.phone}
                    onChange={(e) => setV({ ...v, phone: e.target.value })}
                    className={control}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <label className={fieldLabel}>
                  Approx. employees
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={v.employees}
                    onChange={(e) => setV({ ...v, employees: e.target.value })}
                    placeholder="30"
                    className={control}
                  />
                </label>
                <label className={fieldLabel}>
                  What you need
                  <select
                    value={v.service}
                    onChange={(e) =>
                      setV({ ...v, service: e.target.value as Service })
                    }
                    className={control}
                  >
                    {SERVICES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className={fieldLabel}>
                Office location
                <input
                  type="text"
                  required
                  value={v.location}
                  onChange={(e) => setV({ ...v, location: e.target.value })}
                  placeholder="Street or area, city"
                  className={control}
                />
              </label>
              <label className={fieldLabel}>
                <span>
                  Preferred window{" "}
                  <span className="font-normal text-muted">(optional)</span>
                </span>
                <input
                  type="text"
                  value={v.timing}
                  onChange={(e) => setV({ ...v, timing: e.target.value })}
                  placeholder="e.g. week of Nov 10, mornings"
                  className={control}
                />
              </label>
              <label className={fieldLabel}>
                <span>
                  Anything else{" "}
                  <span className="font-normal text-muted">(optional)</span>
                </span>
                <textarea
                  rows={3}
                  value={v.notes}
                  onChange={(e) => setV({ ...v, notes: e.target.value })}
                  placeholder="Group size per day, boardroom setup, deadline"
                  className={`${control} resize-y`}
                />
              </label>
              <ErrorBanner message={error} />
              <button
                type="submit"
                disabled={busy}
                className="min-h-[50px] rounded-full bg-brand p-[15px] text-base font-bold text-white transition-colors hover:bg-brand-bright disabled:opacity-60"
              >
                {busy ? "Sending…" : "Request a quote"}
              </button>
              <p className="text-center text-[13px] text-muted">
                No obligation — we reply with a custom quote.
              </p>
            </div>
          )}
        </form>
      </div>

      <Dialog
        open={failed}
        title="Request didn’t send"
        tone="error"
        onClose={() => setFailed(false)}
      >
        Something went wrong on our end. Please try again, or email us directly
        at hello@snapid.ca.
      </Dialog>
    </section>
  );
}
