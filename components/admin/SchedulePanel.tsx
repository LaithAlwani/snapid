"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DAY_START, DAY_END, dateKey, gridTimes } from "@/lib/schedule";
import { prettyDate } from "./format";

const TIMES = gridTimes();

export function SchedulePanel() {
  // A query may not read the clock, so today's key is computed here.
  const today = useMemo(() => dateKey(new Date()), []);
  const blocks = useQuery(api.blocks.listBlocks, { from: today });
  const createBlock = useMutation(api.blocks.createBlock);
  const deleteBlock = useMutation(api.blocks.deleteBlock);

  const [date, setDate] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [startMinutes, setStartMinutes] = useState(DAY_START);
  const [endMinutes, setEndMinutes] = useState(DAY_END);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    if (!date) {
      setError("Pick a date.");
      return;
    }
    if (!allDay && endMinutes <= startMinutes) {
      setError("The end time has to be after the start time.");
      return;
    }
    setBusy(true);
    try {
      const res = await createBlock({
        date,
        allDay,
        startMinutes: allDay ? undefined : startMinutes,
        endMinutes: allDay ? undefined : endMinutes,
        reason: reason.trim() || undefined,
      });
      setNote(
        res.conflicts > 0
          ? `Blocked. Heads up: ${res.conflicts} existing booking${res.conflicts === 1 ? "" : "s"} on ${prettyDate(date)} fall inside this window — they're still confirmed, so call them if you need to move them.`
          : "Blocked.",
      );
      setDate("");
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that block.");
    } finally {
      setBusy(false);
    }
  }

  const label = "grid gap-1.5 text-sm font-semibold text-heading";
  const control =
    "min-h-[42px] w-full rounded-[10px] border border-hairline-strong bg-white px-[13px] py-2 focus:border-brand focus:outline-none";

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={onSubmit}
        noValidate
        className="h-fit rounded-xl border border-hairline bg-white p-4"
      >
        <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
          Block time off
        </div>
        <div className="grid gap-3">
          <label className={label}>
            Date
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className={control}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-heading">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 accent-[#1d4ed8]"
            />
            Closed all day
          </label>

          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <label className={label}>
                From
                <select
                  value={startMinutes}
                  onChange={(e) => setStartMinutes(Number(e.target.value))}
                  className={control}
                >
                  {TIMES.filter((t) => t.minutes < DAY_END).map((t) => (
                    <option key={t.minutes} value={t.minutes}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                To
                <select
                  value={endMinutes}
                  onChange={(e) => setEndMinutes(Number(e.target.value))}
                  className={control}
                >
                  {TIMES.filter((t) => t.minutes > startMinutes).map((t) => (
                    <option key={t.minutes} value={t.minutes}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <label className={label}>
            <span>
              Reason{" "}
              <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Vacation, mobile job, lunch"
              className={control}
            />
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-[10px] bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
            >
              {error}
            </div>
          )}
          {note && (
            <div className="rounded-[10px] bg-sky-100 px-3 py-2 text-sm text-heading">
              {note}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="min-h-[44px] rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-bright disabled:opacity-60"
          >
            {busy ? "Saving…" : "Block this time"}
          </button>
        </div>
      </form>

      <div>
        <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
          Upcoming blocked time
        </div>
        <div className="grid gap-2">
          {blocks?.map((b) => (
            <div
              key={b._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-white p-4"
            >
              <div>
                <div className="font-semibold text-heading">
                  {prettyDate(b.date)}
                  <span className="ml-2 font-normal text-muted">
                    {b.allDay
                      ? "Closed all day"
                      : `${minutes(b.startMinutes)} – ${minutes(b.startMinutes + b.durationMinutes)}`}
                  </span>
                </div>
                {b.reason && (
                  <div className="mt-0.5 text-sm text-muted">{b.reason}</div>
                )}
              </div>
              <button
                onClick={() => deleteBlock({ id: b._id })}
                className="rounded-full border border-hairline-strong px-4 py-1.5 text-sm font-semibold hover:bg-sky-100"
              >
                Remove
              </button>
            </div>
          ))}
          {blocks && blocks.length === 0 && (
            <div className="rounded-xl border border-hairline bg-white px-4 py-10 text-center text-muted">
              Nothing blocked. The studio is bookable 9:00 am–7:00 pm every day.
            </div>
          )}
          {blocks === undefined && (
            <div className="py-10 text-center text-muted">Loading…</div>
          )}
        </div>
      </div>
    </div>
  );
}

function minutes(m: number): string {
  return TIMES.find((t) => t.minutes === m)?.label ?? String(m);
}
