"use client";

import { useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { money, prettyDate, PLACE_LABEL, DELIVERABLE_LABEL } from "./format";
import { partySummary, formatDuration } from "@/lib/pricing";
import { Pill } from "./ui";

const STATUSES = ["requested", "confirmed", "completed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const FILTERS: Array<{ key: Status | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "requested", label: "Requested" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export function BookingsPanel() {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [date, setDate] = useState<string>("");
  const { results, status, loadMore } = usePaginatedQuery(
    api.bookings.listBookings,
    {
      ...(filter === "all" ? {} : { status: filter }),
      ...(date ? { date } : {}),
    },
    { initialNumItems: 20 },
  );
  const updateStatus = useMutation(api.bookings.updateStatus);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.key
                ? "bg-navy text-white"
                : "bg-white text-heading hover:bg-sky-100"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm font-semibold text-muted">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-hairline-strong bg-white px-2.5 py-1.5 text-sm focus:border-brand focus:outline-none"
          />
          {date && (
            <button
              onClick={() => setDate("")}
              className="rounded-full px-2.5 py-1.5 text-sm font-semibold text-brand hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="custom-scroll overflow-x-auto rounded-xl border border-hairline bg-white">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline bg-surface-2 text-left text-[12px] uppercase tracking-[0.06em] text-muted">
              <th className="px-4 py-3 font-bold">Appointment</th>
              <th className="px-4 py-3 font-bold">Customer</th>
              <th className="px-4 py-3 font-bold">Job</th>
              <th className="px-4 py-3 font-bold">Where</th>
              <th className="px-4 py-3 text-right font-bold">Est.</th>
              <th className="px-4 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((b) => (
              <tr
                key={b._id}
                className="border-b border-hairline-soft align-top last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-heading">
                    {prettyDate(b.date)}
                  </div>
                  <div className="text-muted">
                    {b.slot} · {formatDuration(b.durationMinutes)}
                  </div>
                  {b.source === "chat" && (
                    <span className="mt-1 inline-block rounded bg-sky-100 px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                      via chat
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-heading">{b.name}</div>
                  <div className="text-muted">{b.phone}</div>
                  <div className="text-muted">{b.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-heading">
                    {b.docType} · {b.country}
                  </div>
                  <div className="text-muted">
                    {partySummary(b.counts)} · {DELIVERABLE_LABEL[b.deliverable]}
                  </div>
                  {b.notes && (
                    <div className="mt-1 max-w-[240px] text-xs italic text-muted">
                      “{b.notes}”
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-heading">{PLACE_LABEL[b.place]}</div>
                  {b.address && (
                    <div className="max-w-[200px] text-xs text-muted">
                      {b.address}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-heading">
                  {money(b.estimateTotal)}
                </td>
                <td className="px-4 py-3">
                  <div className="mb-2">
                    <Pill kind="booking" value={b.status} />
                  </div>
                  <select
                    value={b.status}
                    onChange={(e) =>
                      updateStatus({
                        id: b._id,
                        status: e.target.value as Status,
                      })
                    }
                    className="rounded-lg border border-hairline-strong bg-white px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {results.length === 0 && status !== "LoadingFirstPage" && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {status === "CanLoadMore" && (
        <div className="mt-4 text-center">
          <button
            onClick={() => loadMore(20)}
            className="rounded-full border border-hairline-strong px-5 py-2 text-sm font-semibold hover:bg-sky-100"
          >
            Load more
          </button>
        </div>
      )}
      {status === "LoadingFirstPage" && (
        <p className="mt-4 text-center text-sm text-muted">Loading…</p>
      )}
    </div>
  );
}
