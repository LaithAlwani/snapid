import { QueryCtx } from "../_generated/server";
import { type Interval } from "../../lib/schedule";

/**
 * Blocked intervals for a day. Lives here, beside requireAdmin, so both
 * convex/blocks.ts and convex/bookings.ts compute availability from one
 * definition of "unavailable" instead of two that can drift apart.
 */
export async function blockedIntervalsForDate(
  ctx: QueryCtx,
  date: string,
): Promise<Interval[]> {
  const rows = await ctx.db
    .query("blockedTimes")
    .withIndex("by_date", (q) => q.eq("date", date))
    .collect();
  return rows.map((r) => ({
    start: r.startMinutes,
    duration: r.durationMinutes,
  }));
}
