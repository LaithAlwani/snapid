import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Reusable validators for the booking domain.
export const tierValidator = v.union(
  v.literal("adult"),
  v.literal("child"),
  v.literal("toddler"),
  v.literal("baby"),
);
export const deliverableValidator = v.union(
  v.literal("print"),
  v.literal("digital"),
  v.literal("both"),
);
export const placeValidator = v.union(
  v.literal("studio"),
  v.literal("near"),
  v.literal("far"),
  v.literal("beyond"),
);
export const docTypeValidator = v.union(
  v.literal("Passport"),
  v.literal("Visa"),
  v.literal("PR card"),
  v.literal("Citizenship"),
  v.literal("Other ID"),
);
export const bookingStatusValidator = v.union(
  v.literal("requested"),
  v.literal("confirmed"),
  v.literal("completed"),
  v.literal("cancelled"),
);
export const corporateServiceValidator = v.union(
  v.literal("headshots"),
  v.literal("passportDay"),
  v.literal("both"),
);
export const corporateLeadStatusValidator = v.union(
  v.literal("new"),
  v.literal("quoted"),
  v.literal("won"),
  v.literal("lost"),
);
export const countsValidator = v.object({
  adult: v.number(),
  child: v.number(),
  toddler: v.number(),
  baby: v.number(),
});

export default defineSchema({
  // @convex-dev/auth tables (users, authSessions, authAccounts, ...).
  ...authTables,

  // Every appointment request from the site or the chat assistant.
  bookings: defineTable({
    clientId: v.optional(v.id("clients")),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    country: v.string(),
    docType: docTypeValidator,
    counts: countsValidator, // adults / children / toddlers / babies
    people: v.number(), // total heads (derived, stored for convenience)
    deliverable: deliverableValidator,
    place: placeValidator,
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    date: v.string(), // ISO date, e.g. "2026-08-28"
    slot: v.string(), // start-time label, e.g. "10:00 am"
    startMinutes: v.number(), // minutes from midnight, e.g. 600 = 10:00
    durationMinutes: v.number(), // total time reserved
    estimateTotal: v.number(), // canonical total incl. HST, computed server-side
    status: bookingStatusValidator,
    source: v.union(v.literal("web"), v.literal("chat")),
  })
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_client", ["clientId"]),

  // CRM record, one per email. Upserted whenever a booking comes in.
  clients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    totalBookings: v.number(),
    totalEstimate: v.number(),
    lastBookingDate: v.optional(v.string()),
    lastCountry: v.optional(v.string()),
    // Admin-managed CRM fields:
    status: v.union(
      v.literal("lead"),
      v.literal("active"),
      v.literal("archived"),
    ),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" }),

  // Contact-form messages (separate from bookings).
  contactMessages: defineTable({
    name: v.string(),
    contact: v.string(), // email or phone, as typed
    message: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied"),
    ),
  }).index("by_status", ["status"]),

  // Corporate quote requests (on-site headshots / staff passport day). Lead
  // only — no slot, no price, no estimate: the owner replies with a quote.
  // Deliberately not contactMessages (free text, wrong lifecycle) and not
  // clients (one row per person-email, with booking-derived revenue counters).
  corporateLeads: defineTable({
    company: v.string(),
    contactName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    employees: v.number(), // approximate head count, 1-5000
    service: corporateServiceValidator,
    location: v.string(), // office location, drives the travel component
    timing: v.optional(v.string()), // free text, e.g. "week of Nov 10"
    notes: v.optional(v.string()),
    status: corporateLeadStatusValidator,
  }).index("by_status", ["status"]),
});
