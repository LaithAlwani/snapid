"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { money, prettyDate } from "./format";
import { dateKey } from "@/lib/schedule";

export function AnalyticsPanel() {
  // Date boundaries computed client-side (queries can't read the clock).
  const bounds = useMemo(() => {
    const now = new Date();
    const today = dateKey(now);
    const dow = (now.getDay() + 6) % 7; // Monday = 0
    const weekStartD = new Date(now);
    weekStartD.setDate(now.getDate() - dow);
    const weekEndD = new Date(weekStartD);
    weekEndD.setDate(weekStartD.getDate() + 6);
    return {
      today,
      weekStart: dateKey(weekStartD),
      weekEnd: dateKey(weekEndD),
      monthPrefix: today.slice(0, 7),
      yearPrefix: today.slice(0, 4),
    };
  }, []);

  const data = useQuery(api.bookings.analytics, bounds);

  const cards = [
    { label: "Today", key: "day" as const },
    { label: "This week", key: "week" as const },
    { label: "This month", key: "month" as const },
    { label: "This year", key: "year" as const },
    { label: "All time", key: "all" as const },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const p = data?.periods[c.key];
          return (
            <div
              key={c.key}
              className={`rounded-xl border p-4 ${c.key === "day" ? "border-brand bg-brand/5" : "border-hairline bg-white"}`}
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                {c.label}
              </div>
              <div className="mt-1 font-heading text-[22px] font-extrabold text-heading">
                {p ? money(p.revenue) : "—"}
              </div>
              <div className="text-[12.5px] text-muted">
                {p ? `${p.count} booking${p.count === 1 ? "" : "s"}` : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-heading text-[15px] font-bold text-heading">
          Bookings by appointment date
        </h3>
        <div className="overflow-hidden rounded-xl border border-hairline bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-2 text-left text-[12px] uppercase tracking-[0.06em] text-muted">
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 text-center font-bold">Bookings</th>
                <th className="px-4 py-3 text-right font-bold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(data?.byDate ?? []).map((d) => (
                <tr
                  key={d.date}
                  className="border-b border-hairline-soft last:border-0"
                >
                  <td className="px-4 py-2.5 font-semibold text-heading">
                    {prettyDate(d.date)}
                  </td>
                  <td className="px-4 py-2.5 text-center text-muted">
                    {d.count}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-heading">
                    {money(d.revenue)}
                  </td>
                </tr>
              ))}
              {data && data.byDate.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-muted">
                    No bookings yet.
                  </td>
                </tr>
              )}
              {!data && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-muted">
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.capped && (
          <p className="mt-2 text-xs text-muted">
            Showing the most recent 5,000 bookings.
          </p>
        )}
      </div>
    </div>
  );
}
