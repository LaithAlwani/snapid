import { v } from "convex/values";
import {
  mutation,
  query,
  internalQuery,
  MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import {
  deliverableValidator,
  placeValidator,
  docTypeValidator,
  countsValidator,
  bookingStatusValidator,
} from "./schema";
import { requireAdmin } from "./lib/admin";
import {
  appointmentTotals,
  appointmentMinutes,
  totalPeople,
  type Counts,
} from "../lib/pricing";
import {
  DAY_START,
  DAY_END,
  isStartAvailable,
  minutesToLabel,
  type Interval,
} from "../lib/schedule";

const bookingInput = {
  name: v.string(),
  phone: v.string(),
  email: v.string(),
  country: v.string(),
  docType: docTypeValidator,
  counts: countsValidator,
  deliverable: deliverableValidator,
  place: placeValidator,
  address: v.optional(v.string()),
  notes: v.optional(v.string()),
  date: v.string(),
  startMinutes: v.number(),
};

function normalizeCounts(counts: Counts): Counts {
  return {
    adult: Math.max(0, Math.floor(counts.adult || 0)),
    child: Math.max(0, Math.floor(counts.child || 0)),
    toddler: Math.max(0, Math.floor(counts.toddler || 0)),
    baby: Math.max(0, Math.floor(counts.baby || 0)),
  };
}

async function upsertClient(
  ctx: MutationCtx,
  args: {
    name: string;
    email: string;
    phone: string;
    country: string;
    date: string;
    estimate: number;
  },
): Promise<Id<"clients">> {
  const email = args.email.trim().toLowerCase();
  const existing = await ctx.db
    .query("clients")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();

  if (existing) {
    await ctx.db.patch("clients", existing._id, {
      name: args.name || existing.name,
      phone: args.phone || existing.phone,
      totalBookings: existing.totalBookings + 1,
      totalEstimate: existing.totalEstimate + args.estimate,
      lastBookingDate: args.date,
      lastCountry: args.country || existing.lastCountry,
      status: existing.status === "archived" ? "active" : existing.status,
    });
    return existing._id;
  }

  return await ctx.db.insert("clients", {
    name: args.name,
    email,
    phone: args.phone,
    totalBookings: 1,
    totalEstimate: args.estimate,
    lastBookingDate: args.date,
    lastCountry: args.country,
    status: "lead",
    tags: [],
  });
}

async function intervalsForDate(
  ctx: MutationCtx,
  date: string,
): Promise<Interval[]> {
  const rows = await ctx.db
    .query("bookings")
    .withIndex("by_date", (q) => q.eq("date", date))
    .collect();
  return rows
    .filter((r) => r.status !== "cancelled")
    .map((r) => ({ start: r.startMinutes, duration: r.durationMinutes }));
}

// Public: booked intervals for a day, so the client can compute which start
// times fit a given appointment length.
export const bookedIntervals = query({
  args: { date: v.string() },
  handler: async (ctx, args): Promise<Interval[]> => {
    const rows = await ctx.db
      .query("bookings")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    return rows
      .filter((r) => r.status !== "cancelled")
      .map((r) => ({ start: r.startMinutes, duration: r.durationMinutes }));
  },
});

// Public: create an appointment request from the site or the chat assistant.
export const createBooking = mutation({
  args: {
    ...bookingInput,
    source: v.optional(v.union(v.literal("web"), v.literal("chat"))),
  },
  handler: async (ctx, args) => {
    const counts = normalizeCounts(args.counts);
    const people = totalPeople(counts);
    if (people < 1) {
      throw new Error("Add at least one person to the appointment.");
    }

    const durationMinutes = appointmentMinutes(counts);
    const start = Math.round(args.startMinutes);

    if (start < DAY_START || start + durationMinutes > DAY_END) {
      throw new Error("That time is outside our hours (9:00 am–7:00 pm).");
    }

    const intervals = await intervalsForDate(ctx, args.date);
    if (!isStartAvailable(start, durationMinutes, intervals)) {
      throw new Error(
        "That time was just taken or doesn't fit the appointment length. Please pick another.",
      );
    }

    const t = appointmentTotals({
      counts,
      deliverable: args.deliverable,
      place: args.place,
    });

    const clientId = await upsertClient(ctx, {
      name: args.name,
      email: args.email,
      phone: args.phone,
      country: args.country,
      date: args.date,
      estimate: t.total,
    });

    const bookingId = await ctx.db.insert("bookings", {
      clientId,
      name: args.name,
      phone: args.phone,
      email: args.email.trim().toLowerCase(),
      country: args.country,
      docType: args.docType,
      counts,
      people,
      deliverable: args.deliverable,
      place: args.place,
      address: args.address,
      notes: args.notes,
      date: args.date,
      slot: minutesToLabel(start),
      startMinutes: start,
      durationMinutes,
      estimateTotal: t.total,
      status: "confirmed",
      source: args.source ?? "web",
    });

    // Fire the confirmation email right away (Node action; no-op if SMTP unset).
    await ctx.scheduler.runAfter(0, internal.email.sendBookingConfirmation, {
      bookingId,
    });

    return bookingId;
  },
});

// Internal: hydrate a booking for the confirmation email (no auth; called by
// the email action only).
export const getForEmail = internalQuery({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get("bookings", args.id);
  },
});

// ----- Admin -----

export const listBookings = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(bookingStatusValidator),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Filter to a specific appointment date (optionally + status).
    if (args.date) {
      let q = ctx.db
        .query("bookings")
        .withIndex("by_date", (idx) => idx.eq("date", args.date!))
        .order("desc");
      if (args.status) {
        const status = args.status;
        q = q.filter((f) => f.eq(f.field("status"), status));
      }
      return await q.paginate(args.paginationOpts);
    }

    if (args.status) {
      return await ctx.db
        .query("bookings")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("bookings")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Revenue totals per period + a per-appointment-date breakdown. Date boundaries
// are passed in (queries must not read the wall clock). Excludes cancelled.
export const analytics = query({
  args: {
    today: v.string(), // YYYY-MM-DD
    weekStart: v.string(),
    weekEnd: v.string(),
    monthPrefix: v.string(), // YYYY-MM
    yearPrefix: v.string(), // YYYY
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Bounded scan of recent bookings (cap noted in the UI).
    const rows = await ctx.db.query("bookings").order("desc").take(5000);

    const mk = () => ({ count: 0, revenue: 0 });
    const periods = {
      day: mk(),
      week: mk(),
      month: mk(),
      year: mk(),
      all: mk(),
    };
    const byDateMap = new Map<string, { count: number; revenue: number }>();

    for (const b of rows) {
      if (b.status === "cancelled") continue;
      const d = b.date;
      const rev = b.estimateTotal;

      periods.all.count += 1;
      periods.all.revenue += rev;
      if (d === args.today) {
        periods.day.count += 1;
        periods.day.revenue += rev;
      }
      if (d >= args.weekStart && d <= args.weekEnd) {
        periods.week.count += 1;
        periods.week.revenue += rev;
      }
      if (d.startsWith(args.monthPrefix)) {
        periods.month.count += 1;
        periods.month.revenue += rev;
      }
      if (d.startsWith(args.yearPrefix)) {
        periods.year.count += 1;
        periods.year.revenue += rev;
      }

      const agg = byDateMap.get(d) ?? { count: 0, revenue: 0 };
      agg.count += 1;
      agg.revenue += rev;
      byDateMap.set(d, agg);
    }

    const byDate = Array.from(byDateMap.entries())
      .map(([date, v2]) => ({ date, ...v2 }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    return { periods, byDate, scanned: rows.length, capped: rows.length >= 5000 };
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: bookingStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("bookings", args.id, { status: args.status });
    return null;
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const recent = await ctx.db.query("bookings").order("desc").take(500);
    const byStatus = { requested: 0, confirmed: 0, completed: 0, cancelled: 0 };
    let pipeline = 0;
    for (const b of recent) {
      byStatus[b.status] += 1;
      if (b.status === "requested" || b.status === "confirmed") {
        pipeline += b.estimateTotal;
      }
    }
    return { total: recent.length, byStatus, pipeline };
  },
});
