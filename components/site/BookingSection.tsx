"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBooking } from "./BookingContext";
import { Dialog, ErrorBanner } from "./Dialog";
import {
  TIERS,
  PLACES,
  DELIVERABLE_LABELS,
  CATEGORY_META,
  money,
  appointmentTotals,
  totalPeople,
  formatDuration,
} from "@/lib/pricing";
import { COUNTRIES, DOW, MON } from "@/lib/site-data";
import { dateKey, startSlots, upcomingDays } from "@/lib/schedule";
import { HScroll } from "./HScroll";

const fieldLabel = "grid gap-1.5 text-sm font-semibold text-heading";
const control =
  "min-h-[46px] w-full rounded-[10px] border border-hairline-strong bg-white px-[13px] py-3 focus:border-brand focus:outline-none";

export function BookingSection() {
  const { form, setField, setCount } = useBooking();
  const createBooking = useMutation(api.bookings.createBooking);

  const days = useMemo(() => upcomingDays(14), []);
  const [dayIndex, setDayIndex] = useState(0);
  const [startMinutes, setStartMinutes] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    title: string;
    tone: "error" | "success";
    body: string;
  } | null>(null);
  const [confirmation, setConfirmation] = useState<{
    line: string;
    total: string;
  } | null>(null);

  const selectedDate = days[dayIndex];
  const booked =
    useQuery(api.bookings.bookedIntervals, { date: dateKey(selectedDate) }) ?? [];

  const t = appointmentTotals(form);
  const people = totalPeople(form.counts);
  const slots = people > 0 ? startSlots(t.minutes, booked) : [];

  const dateLine = `${DOW[selectedDate.getDay()]}, ${MON[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  const totalLine =
    form.place === "beyond"
      ? `${money(t.total)} + travel quote`
      : money(t.total);
  const needsAddress = form.place !== "studio";
  const selectedSlotLabel =
    startMinutes != null
      ? slots.find((s) => s.minutes === startMinutes)?.label
      : null;

  const estimate = [
    { label: `Sitting — ${people} ${people === 1 ? "person" : "people"} (${DELIVERABLE_LABELS[form.deliverable]})`, value: money(t.sitting) },
    {
      label: PLACES[form.place].label,
      value: form.place === "beyond" ? "Quoted" : money(t.travel),
    },
    { label: "HST 13%", value: money(t.hst) },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (people < 1) {
      setFormError("Add at least one person below (adults, children, toddlers or babies).");
      return;
    }
    if (startMinutes == null) {
      setFormError("Pick a day and an available time above.");
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.country.trim()) {
      setFormError("Please fill in your name, phone, email and the country the photo is for.");
      return;
    }

    setBusy(true);
    try {
      await createBooking({
        name: form.name,
        phone: form.phone,
        email: form.email,
        country: form.country,
        docType: form.docType,
        counts: form.counts,
        deliverable: form.deliverable,
        place: form.place,
        address: needsAddress ? form.address : undefined,
        notes: form.notes || undefined,
        date: dateKey(selectedDate),
        startMinutes,
        source: "web",
      });
      setConfirmation({
        line: `${dateLine} at ${selectedSlotLabel} — ${form.docType.toLowerCase()} for ${form.country || "your country"}, ${people} ${people === 1 ? "person" : "people"}, ${PLACES[form.place].label.toLowerCase()}. Reserved ${formatDuration(t.minutes)}.`,
        total: totalLine,
      });
    } catch (err) {
      setDialog({
        title: "Couldn’t book that slot",
        tone: "error",
        body:
          err instanceof Error
            ? err.message
            : "Something went wrong requesting that appointment. Please try again.",
      });
      setStartMinutes(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="book" className="border-t border-hairline bg-white">
      <div className="mx-auto max-w-[1120px] px-[18px] py-16">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
          Book
        </h2>
        <p className="mt-3 font-heading text-[28px] font-bold leading-[1.2]">
          Pick a time that&apos;s open.
        </p>
        <p className="mt-2 text-[15px] text-muted">
          Appointments run 9:00 am–7:00 pm. We reserve time based on who&apos;s
          coming — adults and children 5+ take 10 min each, toddlers 15 min, and
          babies 30 min.
        </p>

        {confirmation ? (
          <div className="animate-pop mt-7 rounded-2xl border border-brand bg-surface p-7">
            <div className="font-heading text-[24px] font-extrabold">
              You&apos;re booked
            </div>
            <p className="mt-2.5 text-[16.5px] leading-[1.55] text-heading">
              {confirmation.line}
            </p>
            <p className="mt-2.5 text-[15.5px] leading-[1.55] text-muted">
              A confirmation email is on its way to {form.email || "your inbox"}.
              Total: {confirmation.total}
            </p>
            <button
              type="button"
              onClick={() => {
                setConfirmation(null);
                setStartMinutes(null);
              }}
              className="mt-[18px] min-h-[46px] rounded-full bg-navy px-[22px] py-3 font-semibold text-white transition-colors hover:bg-brand"
            >
              Book another
            </button>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-[26px] md:grid-cols-2">
            {/* Left: party + day + time */}
            <div>
              <div className="mb-3 font-heading text-[15px] font-bold">
                1 · Who&apos;s coming
              </div>
              <div className="grid gap-2.5">
                {CATEGORY_META.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-white p-3"
                  >
                    <div>
                      <div className="text-[15px] font-semibold text-heading">
                        {c.label}
                      </div>
                      <div className="text-[12.5px] text-muted">{c.hint}</div>
                    </div>
                    <Stepper
                      value={form.counts[c.key]}
                      onChange={(n) => {
                        setCount(c.key, n);
                        setStartMinutes(null);
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2.5 text-[13.5px] text-muted">
                {people > 0
                  ? `${people} ${people === 1 ? "person" : "people"} · about ${formatDuration(t.minutes)} with the photographer.`
                  : "Add at least one person to see available times."}
              </p>

              <div className="mb-3 mt-[22px] font-heading text-[15px] font-bold">
                2 · Choose a day
              </div>
              <HScroll className="pb-2" amount={200}>
                <div className="flex gap-2">
                  {days.map((d, i) => {
                    const sel = i === dayIndex;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          setDayIndex(i);
                          setStartMinutes(null);
                        }}
                        className={`min-h-[66px] w-[62px] flex-none rounded-xl border py-2.5 text-center ${
                          sel
                            ? "border-navy bg-navy text-white"
                            : "border-hairline-strong bg-white text-heading"
                        }`}
                      >
                        <div className="text-[11.5px] uppercase tracking-[0.06em] opacity-70">
                          {DOW[d.getDay()]}
                        </div>
                        <div className="mt-0.5 font-heading text-[19px] font-bold">
                          {d.getDate()}
                        </div>
                        <div className="text-[11px] opacity-70">
                          {MON[d.getMonth()]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </HScroll>

              <div className="mb-3 mt-[22px] font-heading text-[15px] font-bold">
                3 · Choose a start time
              </div>
              {people < 1 ? (
                <p className="text-sm text-muted">
                  Tell us who&apos;s coming first — times depend on how long the
                  session needs.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2">
                    {slots.map((s) => {
                      const sel = startMinutes === s.minutes;
                      return (
                        <button
                          type="button"
                          key={s.minutes}
                          disabled={!s.available}
                          onClick={() => s.available && setStartMinutes(s.minutes)}
                          className={`min-h-[46px] rounded-[10px] border px-1.5 py-3 text-[15px] font-semibold ${
                            !s.available
                              ? "cursor-not-allowed border-hairline bg-[#F1F4F9] text-[#A9B4C4] line-through"
                              : sel
                                ? "border-brand bg-brand text-white"
                                : "border-hairline-strong bg-white text-heading hover:border-brand"
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-sm text-muted">
                    Struck-through times don&apos;t fit a{" "}
                    {formatDuration(t.minutes)} session or are already booked.
                    Appointment only — no walk-ins.
                  </p>
                </>
              )}
            </div>

            {/* Right: details form */}
            <form
              onSubmit={submit}
              noValidate
              className="rounded-2xl border border-hairline bg-surface p-[22px]"
            >
              <div className="font-heading text-[15px] font-bold">
                4 · Your details
              </div>
              <div className="mt-4 grid gap-3.5">
                <label className={fieldLabel}>
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Full name"
                    className={control}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3.5">
                  <label className={fieldLabel}>
                    Phone
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="613 000 0000"
                      className={control}
                    />
                  </label>
                  <label className={fieldLabel}>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="you@email.com"
                      className={control}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <label className={fieldLabel}>
                    Country the photo is for
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setField("country", e.target.value)}
                      placeholder="e.g. India"
                      list="snapid-countries"
                      className={control}
                    />
                  </label>
                  <label className={fieldLabel}>
                    Photo type
                    <select
                      value={form.docType}
                      onChange={(e) =>
                        setField("docType", e.target.value as typeof form.docType)
                      }
                      className={control}
                    >
                      <option value="Passport">Passport</option>
                      <option value="Visa">Visa</option>
                      <option value="PR card">PR card</option>
                      <option value="Citizenship">Citizenship</option>
                      <option value="Other ID">Other ID</option>
                    </select>
                  </label>
                </div>
                <label className={fieldLabel}>
                  What you need
                  <select
                    value={form.deliverable}
                    onChange={(e) =>
                      setField(
                        "deliverable",
                        e.target.value as typeof form.deliverable,
                      )
                    }
                    className={control}
                  >
                    <option value="print">Printed set</option>
                    <option value="digital">Digital only (−$5)</option>
                    <option value="both">Printed set + digital (+$10)</option>
                  </select>
                </label>
                <label className={fieldLabel}>
                  Where
                  <select
                    value={form.place}
                    onChange={(e) =>
                      setField("place", e.target.value as typeof form.place)
                    }
                    className={control}
                  >
                    <option value="studio">
                      Home studio — Riverside South / Barrhaven
                    </option>
                    <option value="near">
                      Mobile service, within 20 km (+$75)
                    </option>
                    <option value="far">Mobile service, 20–40 km (+$99)</option>
                    <option value="beyond">
                      Mobile service, beyond 40 km (we&apos;ll quote)
                    </option>
                  </select>
                </label>
                {needsAddress && (
                  <label className={fieldLabel}>
                    Address
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                      placeholder="Street, city, postal code"
                      className={control}
                    />
                  </label>
                )}
                <label className={fieldLabel}>
                  Notes / special needs
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    placeholder="Newborn, wheelchair access, deadline, anything else"
                    className={`${control} resize-y`}
                  />
                </label>
              </div>

              <div className="mt-[18px] rounded-xl border border-hairline bg-white p-4">
                <div className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  Estimate
                </div>
                <div className="mt-3 grid gap-2">
                  {estimate.map((e) => (
                    <div
                      key={e.label}
                      className="flex justify-between gap-3 text-[15px] text-muted"
                    >
                      <span>{e.label}</span>
                      <span className="font-semibold text-heading">
                        {e.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between gap-3 border-t border-hairline-soft pt-3 font-heading text-[19px] font-extrabold">
                  <span>Total</span>
                  <span>{totalLine}</span>
                </div>
                <p className="mt-2.5 text-[13.5px] text-muted">
                  {selectedSlotLabel
                    ? `Selected: ${dateLine} at ${selectedSlotLabel} · ${formatDuration(t.minutes)}`
                    : "Pick a day and time above."}
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                <ErrorBanner message={formError} />
                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-[52px] w-full rounded-full bg-brand p-4 text-[16.5px] font-bold text-white transition-colors hover:bg-navy disabled:opacity-60"
                >
                  {busy ? "Booking…" : "Confirm booking"}
                </button>
              </div>
              <p className="mt-2.5 text-center text-[13.5px] text-muted">
                No payment now. Cash or e-transfer at the appointment.
              </p>
            </form>
          </div>
        )}

        <datalist id="snapid-countries">
          {COUNTRIES.map((c) => (
            <option value={c} key={c} />
          ))}
        </datalist>
      </div>

      <Dialog
        open={dialog !== null}
        title={dialog?.title ?? ""}
        tone={dialog?.tone ?? "neutral"}
        onClose={() => setDialog(null)}
      >
        {dialog?.body}
      </Dialog>
    </section>
  );
}

function Stepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="grid h-9 w-9 place-items-center rounded-full border border-hairline-strong bg-white text-lg font-bold text-heading hover:border-brand disabled:opacity-40"
        disabled={value <= 0}
      >
        −
      </button>
      <input
        type="number"
        min={0}
        max={20}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 w-12 rounded-lg border border-hairline-strong text-center text-[15px] font-semibold focus:border-brand focus:outline-none"
      />
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
        className="grid h-9 w-9 place-items-center rounded-full border border-hairline-strong bg-white text-lg font-bold text-heading hover:border-brand"
      >
        +
      </button>
    </div>
  );
}
