"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, ErrorBanner } from "./Dialog";
import {
  CATEGORY_META,
  DELIVERABLE_LABELS,
  appointmentTotals,
  appointmentMinutes,
  totalPeople,
  partySummary,
  formatDuration,
  money,
  type Counts,
  type Deliverable,
  type DocType,
  type Place,
} from "@/lib/pricing";
import { COUNTRIES, DOW, MON } from "@/lib/site-data";
import { dateKey, startSlots, upcomingDays } from "@/lib/schedule";
import { HScroll } from "./HScroll";

type Msg = { role: "user" | "assistant"; content: string };
type Step =
  | "place"
  | "band"
  | "address"
  | "contact"
  | "party"
  | "photo"
  | "when"
  | "review"
  | "done";

type Draft = {
  place: Place | null;
  address: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  docType: DocType;
  counts: Counts;
  deliverable: Deliverable;
  startMinutes: number | null;
};

const GREETING =
  "Hi — I'm the SnapID assistant. I'll help you book in a minute. First, would you like to come to our home studio, or should we come to you? Mobile visits add a travel fee, so I'll flag that before we talk photo prices.";

const EMPTY_DRAFT: Draft = {
  place: null,
  address: "",
  name: "",
  phone: "",
  email: "",
  country: "",
  docType: "Passport",
  counts: { adult: 1, child: 0, toddler: 0, baby: 0 },
  deliverable: "print",
  startMinutes: null,
};

const chip =
  "min-h-[44px] rounded-xl border border-hairline-strong bg-white px-3.5 py-2 text-left text-[14.5px] font-semibold text-heading hover:border-brand";
const input =
  "min-h-[44px] w-full rounded-[10px] border border-hairline-strong bg-white px-3 py-2.5 text-[15px] focus:border-brand focus:outline-none";
const primaryBtn =
  "min-h-[46px] w-full rounded-full bg-brand px-4 font-bold text-white transition-colors hover:bg-navy disabled:opacity-60";

const PLACE_OPTIONS: Array<{ place: Place; label: string }> = [
  { place: "studio", label: "Studio · no fee" },
  { place: "near", label: "Mobile <20 km · +$75" },
  { place: "far", label: "Mobile 20–40 km · +$99" },
  { place: "beyond", label: "Mobile >40 km · quote" },
];

export function ChatWidget() {
  const chat = useAction(api.chat.chat);
  const createBooking = useMutation(api.bookings.createBooking);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [step, setStep] = useState<Step>("place");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [dayIndex, setDayIndex] = useState(0);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [qDraft, setQDraft] = useState("");
  const [failDialog, setFailDialog] = useState<string | null>(null);

  const days = useMemo(() => upcomingDays(14), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  const duration = appointmentMinutes(draft.counts);
  const people = totalPeople(draft.counts);
  const selectedDate = days[dayIndex];
  const booked =
    useQuery(api.bookings.bookedIntervals, {
      date: dateKey(selectedDate),
    }) ?? [];
  const slots = people > 0 ? startSlots(duration, booked) : [];
  const totals = appointmentTotals({
    counts: draft.counts,
    deliverable: draft.deliverable,
    place: draft.place ?? "studio",
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight + 600;
  }, [messages, step, thinking, open]);

  const pushA = (content: string) =>
    setMessages((m) => [...m, { role: "assistant", content }]);
  const pushU = (content: string) =>
    setMessages((m) => [...m, { role: "user", content }]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function setCount(tier: keyof Counts, value: number) {
    setDraft((d) => ({
      ...d,
      counts: {
        ...d.counts,
        [tier]: Math.max(0, Math.min(20, Math.floor(value) || 0)),
      },
      startMinutes: null,
    }));
  }

  // ---- step transitions ----
  // Jump back to a step from the review to edit it; returns to review on submit.
  function editStep(target: Step) {
    setEditing(true);
    setPanelError(null);
    setStep(target);
  }

  function choosePlace(place: Place, echo: string) {
    pushU(echo);
    set("place", place);
    setPanelError(null);
    if (place === "studio") {
      pushA("Perfect — home studio, no travel fee. What are your contact details?");
      setStep("contact");
    } else {
      pushA(
        "Sure. How far are you from Riverside South? The travel fee is per visit, not per person.",
      );
      setStep("band");
    }
  }

  function chooseBand(place: Place, echo: string) {
    pushU(echo);
    set("place", place);
    if (place === "beyond") {
      pushA(
        "Got it — beyond 40 km we quote the travel separately, and we'll confirm it with you. What's the address we're coming to?",
      );
    } else {
      pushA("Thanks. What's the address we're coming to?");
    }
    setStep("address");
  }

  function submitAddress() {
    if (!draft.address.trim()) {
      setPanelError("Please enter an address.");
      return;
    }
    setPanelError(null);
    pushU(draft.address.trim());
    pushA("Great. What are your contact details?");
    setStep("contact");
  }

  function submitContact() {
    if (!draft.name.trim() || !draft.phone.trim() || !draft.email.trim()) {
      setPanelError("Please add your name, phone and email.");
      return;
    }
    setPanelError(null);
    pushU(`${draft.name.trim()} · ${draft.phone.trim()} · ${draft.email.trim()}`);
    pushA(
      "Who's coming? Enter how many of each — this sets how long the photographer blocks off. Adults and children 5+ take 10 min each, toddlers 15 min, and babies 30 min.",
    );
    setStep("party");
  }

  function submitParty() {
    if (people < 1) {
      setPanelError("Add at least one person.");
      return;
    }
    setPanelError(null);
    pushU(`${partySummary(draft.counts)} — about ${formatDuration(duration)}`);
    if (editing) {
      setEditing(false);
      pushA("Updated. Here's your appointment again.");
      setStep("review");
      return;
    }
    pushA("Which country is the photo for, and what type of photo?");
    setStep("photo");
  }

  function submitPhoto() {
    if (!draft.country.trim()) {
      setPanelError("Please tell us the destination country.");
      return;
    }
    setPanelError(null);
    pushU(`${draft.docType} for ${draft.country.trim()} · ${DELIVERABLE_LABELS[draft.deliverable]}`);
    if (editing) {
      setEditing(false);
      pushA("Updated. Here's your appointment again.");
      setStep("review");
      return;
    }
    pushA(
      `When works for you? Here are the open start times for a ${formatDuration(duration)} session — pick a day and time.`,
    );
    setStep("when");
  }

  function chooseSlot(minutes: number, label: string) {
    set("startMinutes", minutes);
    setPanelError(null);
    setEditing(false);
    pushU(`${DOW[selectedDate.getDay()]}, ${MON[selectedDate.getMonth()]} ${selectedDate.getDate()} at ${label}`);
    pushA("Here's your appointment. Look it over and confirm to book it.");
    setStep("review");
  }

  async function confirmBooking() {
    if (draft.startMinutes == null) {
      setStep("when");
      return;
    }
    setBusy(true);
    try {
      await createBooking({
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
        country: draft.country,
        docType: draft.docType,
        counts: draft.counts,
        deliverable: draft.deliverable,
        place: draft.place ?? "studio",
        address: draft.place !== "studio" ? draft.address : undefined,
        notes: undefined,
        date: dateKey(selectedDate),
        startMinutes: draft.startMinutes,
        source: "chat",
      });
      pushA(
        `You're booked! A confirmation email is on its way to ${draft.email}. Anything else I can help with?`,
      );
      setStep("done");
    } catch (err) {
      setFailDialog(
        err instanceof Error
          ? err.message
          : "Something went wrong sending the request. Please try again.",
      );
      setStep("when");
      set("startMinutes", null);
    } finally {
      setBusy(false);
    }
  }

  // ---- free-text question -> LLM ----
  async function askQuestion(text: string) {
    setQDraft("");
    pushU(text);
    setThinking(true);
    try {
      const history: Msg[] = [...messages, { role: "user", content: text }];
      const res = await chat({ messages: history });
      if (res.prefill) mergePrefill(res.prefill);
      pushA(res.reply);
    } catch {
      pushA(
        "Something went wrong on my end. Please try again, or reach us at hello@snapid.ca.",
      );
    } finally {
      setThinking(false);
    }
  }

  function mergePrefill(data: Record<string, unknown>) {
    setDraft((d) => {
      const next: Draft = { ...d, counts: { ...d.counts } };
      const s = (k: string) => (typeof data[k] === "string" ? (data[k] as string) : null);
      if (s("name")) next.name = s("name")!;
      if (s("phone")) next.phone = s("phone")!;
      if (s("email")) next.email = s("email")!;
      if (s("country")) next.country = s("country")!;
      if (s("docType")) next.docType = data.docType as DocType;
      if (s("deliverable")) next.deliverable = data.deliverable as Deliverable;
      if (s("place")) next.place = data.place as Place;
      if (s("address")) next.address = s("address")!;
      if (data.counts && typeof data.counts === "object") {
        const c = data.counts as Record<string, unknown>;
        for (const t of ["adult", "child", "toddler", "baby"] as const) {
          const n = Number(c[t]);
          if (!Number.isNaN(n)) next.counts[t] = Math.max(0, Math.min(20, Math.floor(n)));
        }
      }
      return next;
    });
  }

  function restart() {
    setDraft(EMPTY_DRAFT);
    setStep("place");
    setDayIndex(0);
    setPanelError(null);
    setMessages([{ role: "assistant", content: GREETING }]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with SnapID"
        className="fixed bottom-4 right-4 z-[60] grid h-[60px] w-[60px] place-items-center rounded-full bg-brand text-white shadow-[0_10px_30px_rgba(11,21,38,0.35)] transition-colors hover:bg-navy"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
        </svg>
      </button>

      {open && (
        <div className="animate-pop fixed inset-0 z-[61] flex w-full flex-col overflow-hidden bg-white md:inset-auto md:bottom-[88px] md:left-auto md:right-4 md:max-h-[80vh] md:w-[400px] md:rounded-[18px] md:border md:border-hairline-strong md:shadow-[0_24px_60px_rgba(11,21,38,0.28)]">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 bg-navy px-4 py-3.5 text-white">
            <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-brand font-heading text-sm font-extrabold">
              SI
            </div>
            <div className="flex-1">
              <div className="font-heading text-[15.5px] font-bold">
                SnapID assistant
              </div>
              <div className="text-[12.5px] text-accent-on-navy">
                Books appointments · answers questions
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="px-1.5 py-1 text-[22px] leading-none text-accent-on-navy">
              ×
            </button>
          </div>

          {/* Thread */}
          <div ref={scrollRef} className="custom-scroll flex min-h-[110px] flex-1 flex-col gap-3 overflow-y-auto bg-[#F8FAFD] p-4">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="max-w-[84%] self-end whitespace-pre-wrap rounded-[14px_14px_4px_14px] bg-brand px-3.5 py-[11px] text-[15px] leading-[1.5] text-white">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[90%] self-start whitespace-pre-wrap rounded-[14px_14px_14px_4px] border border-hairline bg-white px-3.5 py-[11px] text-[15px] leading-[1.5] text-heading">
                  {m.content}
                </div>
              ),
            )}
            {thinking && (
              <div className="flex gap-1.5 self-start rounded-[14px] border border-hairline bg-white px-3.5 py-3">
                <span className="animate-dot h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="animate-dot h-1.5 w-1.5 rounded-full bg-brand [animation-delay:0.2s]" />
                <span className="animate-dot h-1.5 w-1.5 rounded-full bg-brand [animation-delay:0.4s]" />
              </div>
            )}

            {/* Inline step controls — rendered as part of the conversation */}
            <div className="w-[94%] self-start rounded-[14px_14px_14px_4px] border border-hairline bg-white p-3">
            {panelError && (
              <div className="mb-2.5">
                <ErrorBanner message={panelError} />
              </div>
            )}

            {step === "place" && (
              <div className="grid gap-2">
                <button className={chip} onClick={() => choosePlace("studio", "I'll come to your studio")}>
                  I&apos;ll come to your studio
                  <span className="block text-[12.5px] font-normal text-muted">
                    Riverside South / Barrhaven · no travel fee
                  </span>
                </button>
                <button className={chip} onClick={() => choosePlace("near", "Please come to me")}>
                  Come to me (mobile)
                  <span className="block text-[12.5px] font-normal text-muted">
                    Travel fee applies · we&apos;ll size it up next
                  </span>
                </button>
              </div>
            )}

            {step === "band" && (
              <div className="grid gap-2">
                <button className={chip} onClick={() => chooseBand("near", "Within 20 km (+$75)")}>
                  Within 20 km <span className="font-normal text-muted">· +$75</span>
                </button>
                <button className={chip} onClick={() => chooseBand("far", "20–40 km (+$99)")}>
                  20–40 km <span className="font-normal text-muted">· +$99</span>
                </button>
                <button className={chip} onClick={() => chooseBand("beyond", "Beyond 40 km")}>
                  Beyond 40 km <span className="font-normal text-muted">· we&apos;ll quote</span>
                </button>
                <button
                  className="mt-1 min-h-[40px] rounded-xl border border-dashed border-hairline-strong px-3.5 py-2 text-left text-[13.5px] font-semibold text-brand hover:bg-sky-100"
                  onClick={() => choosePlace("studio", "I changed my mind — I'll come to you")}
                >
                  ↩ I changed my mind — I&apos;ll come to your studio
                  <span className="block text-[12px] font-normal text-muted">
                    No travel fee
                  </span>
                </button>
              </div>
            )}

            {step === "address" && (
              <div className="grid gap-2.5">
                <input
                  className={input}
                  placeholder="Street, city, postal code"
                  value={draft.address}
                  onChange={(e) => set("address", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitAddress()}
                />
                <button className={primaryBtn} onClick={submitAddress}>
                  Continue
                </button>
              </div>
            )}

            {step === "contact" && (
              <div className="grid gap-2.5">
                <input className={input} placeholder="Full name" value={draft.name} onChange={(e) => set("name", e.target.value)} />
                <div className="grid grid-cols-2 gap-2.5">
                  <input className={input} type="tel" placeholder="Phone" value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
                  <input className={input} type="email" placeholder="Email" value={draft.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <button className={primaryBtn} onClick={submitContact}>
                  Continue
                </button>
              </div>
            )}

            {step === "party" && (
              <div className="grid gap-2">
                {CATEGORY_META.map((c) => (
                  <div key={c.key} className="flex items-center justify-between gap-2 rounded-xl border border-hairline p-2.5">
                    <div>
                      <div className="text-[14px] font-semibold text-heading">{c.label}</div>
                      <div className="text-[11.5px] text-muted">{c.hint}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" aria-label="Decrease" onClick={() => setCount(c.key, draft.counts[c.key] - 1)} disabled={draft.counts[c.key] <= 0} className="grid h-8 w-8 place-items-center rounded-full border border-hairline-strong text-lg font-bold disabled:opacity-40">−</button>
                      <span className="w-6 text-center text-[15px] font-semibold">{draft.counts[c.key]}</span>
                      <button type="button" aria-label="Increase" onClick={() => setCount(c.key, draft.counts[c.key] + 1)} className="grid h-8 w-8 place-items-center rounded-full border border-hairline-strong text-lg font-bold">+</button>
                    </div>
                  </div>
                ))}
                <p className="text-[12.5px] text-muted">
                  {people > 0
                    ? `${people} ${people === 1 ? "person" : "people"} · about ${formatDuration(duration)}.`
                    : "Add at least one person."}
                </p>
                <button className={primaryBtn} onClick={submitParty}>
                  Continue
                </button>
              </div>
            )}

            {step === "photo" && (
              <div className="grid gap-2.5">
                <input className={input} list="snapid-chat-countries" placeholder="Country (e.g. India)" value={draft.country} onChange={(e) => set("country", e.target.value)} />
                <datalist id="snapid-chat-countries">
                  {COUNTRIES.map((c) => (
                    <option value={c} key={c} />
                  ))}
                </datalist>
                <div className="grid grid-cols-2 gap-2.5">
                  <select className={input} value={draft.docType} onChange={(e) => set("docType", e.target.value as DocType)}>
                    <option value="Passport">Passport</option>
                    <option value="Visa">Visa</option>
                    <option value="PR card">PR card</option>
                    <option value="Citizenship">Citizenship</option>
                    <option value="Other ID">Other ID</option>
                  </select>
                  <select className={input} value={draft.deliverable} onChange={(e) => set("deliverable", e.target.value as Deliverable)}>
                    <option value="print">Printed set</option>
                    <option value="digital">Digital only</option>
                    <option value="both">Print + digital</option>
                  </select>
                </div>
                <button className={primaryBtn} onClick={submitPhoto}>
                  Continue
                </button>
              </div>
            )}

            {step === "when" && (
              <div className="grid gap-2.5">
                <HScroll className="pb-1" amount={160}>
                  <div className="flex gap-1.5">
                    {days.map((d, i) => {
                      const sel = i === dayIndex;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => {
                            setDayIndex(i);
                            set("startMinutes", null);
                          }}
                          className={`min-h-[54px] w-[50px] flex-none rounded-lg border py-1.5 text-center ${sel ? "border-navy bg-navy text-white" : "border-hairline-strong bg-white text-heading"}`}
                        >
                          <div className="text-[10px] uppercase opacity-70">{DOW[d.getDay()]}</div>
                          <div className="font-heading text-[16px] font-bold">{d.getDate()}</div>
                          <div className="text-[10px] opacity-70">{MON[d.getMonth()]}</div>
                        </button>
                      );
                    })}
                  </div>
                </HScroll>
                <div className="custom-scroll grid max-h-[150px] grid-cols-3 gap-1.5 overflow-y-auto">
                  {slots.map((s) => (
                    <button
                      key={s.minutes}
                      type="button"
                      disabled={!s.available}
                      onClick={() => chooseSlot(s.minutes, s.label)}
                      className={`min-h-[40px] rounded-lg border px-1 py-2 text-[13.5px] font-semibold ${!s.available ? "cursor-not-allowed border-hairline bg-[#F1F4F9] text-[#A9B4C4] line-through" : "border-hairline-strong bg-white text-heading hover:border-brand"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="text-[12px] text-muted">
                  Times that don&apos;t fit a {formatDuration(duration)} session are hidden or struck through.
                </p>
              </div>
            )}

            {step === "review" && (
              <div className="grid gap-3">
                <div className="rounded-xl border border-hairline bg-surface p-3.5 text-[14px]">
                  <EditRow k="Who" v={partySummary(draft.counts)} onEdit={() => editStep("party")} />
                  <EditRow k="Photo" v={`${draft.docType} for ${draft.country} · ${DELIVERABLE_LABELS[draft.deliverable]}`} onEdit={() => editStep("photo")} />
                  <EditRow
                    k="When"
                    v={`${DOW[selectedDate.getDay()]}, ${MON[selectedDate.getMonth()]} ${selectedDate.getDate()}${draft.startMinutes != null ? " at " + slots.find((s) => s.minutes === draft.startMinutes)?.label : ""} · ${formatDuration(duration)}`}
                    onEdit={() => editStep("when")}
                  />

                  {/* Where is editable right here — change your mind about travel */}
                  <div className="mt-1.5">
                    <div className="mb-1 text-muted">Where</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PLACE_OPTIONS.map((o) => (
                        <button
                          key={o.place}
                          type="button"
                          onClick={() => set("place", o.place)}
                          className={`rounded-lg border px-2 py-1.5 text-[12.5px] font-semibold ${draft.place === o.place ? "border-brand bg-brand text-white" : "border-hairline-strong bg-white text-heading hover:border-brand"}`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    {draft.place !== "studio" && draft.address && (
                      <div className="mt-1 text-[12px] text-muted">{draft.address}</div>
                    )}
                  </div>

                  <div className="mt-2.5 border-t border-hairline-soft pt-2">
                    <Row k="Sitting" v={money(totals.sitting)} />
                    {totals.travel > 0 && <Row k="Travel" v={money(totals.travel)} />}
                    {draft.place === "beyond" && <Row k="Travel" v="Quoted separately" />}
                    <Row k="HST 13%" v={money(totals.hst)} />
                    <div className="mt-1 flex justify-between font-heading text-[16px] font-extrabold">
                      <span>Total</span>
                      <span>{draft.place === "beyond" ? `${money(totals.total)} + travel` : money(totals.total)}</span>
                    </div>
                  </div>
                </div>
                <button className={primaryBtn} disabled={busy} onClick={confirmBooking}>
                  {busy ? "Booking…" : "Confirm & book appointment"}
                </button>
                <p className="text-center text-[12px] text-muted">
                  Tap a field above to change it, or just tell me below. No
                  payment now — cash or e-transfer at the appointment.
                </p>
              </div>
            )}

            {step === "done" && (
              <button className={primaryBtn} onClick={restart}>
                Book another appointment
              </button>
            )}
            </div>
          </div>

          {/* Free-text question box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = qDraft.trim();
              if (q && !thinking) askQuestion(q);
            }}
            className="flex shrink-0 gap-2 border-t border-hairline bg-white px-3.5 pb-3 pt-2.5"
          >
            <input
              type="text"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              placeholder="Ask a question…"
              className="min-h-[42px] flex-1 rounded-full border border-hairline-strong px-3.5 py-2 text-[14.5px] focus:border-brand focus:outline-none"
            />
            <button type="submit" aria-label="Send" disabled={thinking} className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full bg-navy text-white hover:bg-brand disabled:opacity-60">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <Dialog
        open={failDialog !== null}
        title="Couldn’t complete the booking"
        tone="error"
        onClose={() => setFailDialog(null)}
      >
        {failDialog}
      </Dialog>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className="text-muted">{k}</span>
      <span className="text-right font-semibold text-heading">{v}</span>
    </div>
  );
}

function EditRow({
  k,
  v,
  onEdit,
}: {
  k: string;
  v: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-0.5">
      <span className="text-muted">{k}</span>
      <span className="flex items-start gap-2 text-right">
        <span className="font-semibold text-heading">{v}</span>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-[12px] font-semibold text-brand hover:underline"
        >
          Edit
        </button>
      </span>
    </div>
  );
}
