import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/admin";
import { DAY_START, DAY_END } from "../lib/schedule";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Public: which days in a range are closed outright, so the booking day picker
 * can grey them out instead of showing a day with no available times.
 */
export const blockedDays = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, args): Promise<string[]> => {
    const rows = await ctx.db
      .query("blockedTimes")
      .withIndex("by_date", (q) =>
        q.gte("date", args.from).lte("date", args.to),
      )
      .collect();
    return [...new Set(rows.filter((r) => r.allDay).map((r) => r.date))];
  },
});

// ----- Admin -----

export const listBlocks = query({
  args: { from: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Upcoming only — past blocks are noise. `from` is passed in because a
    // query may not read the wall clock.
    return await ctx.db
      .query("blockedTimes")
      .withIndex("by_date", (q) => q.gte("date", args.from))
      .take(200);
  },
});

export const createBlock = mutation({
  args: {
    date: v.string(),
    allDay: v.boolean(),
    startMinutes: v.optional(v.number()),
    endMinutes: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const date = args.date.trim();
    if (!ISO_DATE.test(date)) {
      throw new Error("Pick a date.");
    }

    let startMinutes = DAY_START;
    let durationMinutes = DAY_END - DAY_START;

    if (!args.allDay) {
      const start = Math.round(args.startMinutes ?? DAY_START);
      const end = Math.round(args.endMinutes ?? DAY_END);
      if (end <= start) {
        throw new Error("The end time has to be after the start time.");
      }
      if (start < DAY_START || end > DAY_END) {
        throw new Error("Blocks have to sit inside 9:00 am–7:00 pm.");
      }
      startMinutes = start;
      durationMinutes = end - start;
    }

    const id = await ctx.db.insert("blockedTimes", {
      date,
      startMinutes,
      durationMinutes,
      allDay: args.allDay,
      reason: args.reason?.trim() || undefined,
    });

    // Existing confirmed bookings stay valid — blocking a window never
    // cancels anyone. Report the overlap so the owner knows to call them.
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
    const conflicts = bookings.filter(
      (b) =>
        b.status !== "cancelled" &&
        b.startMinutes < startMinutes + durationMinutes &&
        startMinutes < b.startMinutes + b.durationMinutes,
    ).length;

    return { id, conflicts };
  },
});

export const deleteBlock = mutation({
  args: { id: v.id("blockedTimes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete("blockedTimes", args.id);
    return null;
  },
});
