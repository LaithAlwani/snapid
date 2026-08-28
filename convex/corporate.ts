import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./lib/admin";
import {
  corporateServiceValidator,
  corporateLeadStatusValidator,
} from "./schema";

const MAX_EMPLOYEES = 5000;

// Public: corporate quote request from the #corporate section.
export const submitLead = mutation({
  args: {
    company: v.string(),
    contactName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    employees: v.number(),
    service: corporateServiceValidator,
    location: v.string(),
    timing: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const company = args.company.trim();
    const contactName = args.contactName.trim();
    const email = args.email.trim().toLowerCase();
    const location = args.location.trim();

    if (!company || !contactName || !email || !location) {
      throw new Error("Please fill in every required field.");
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("Please enter a valid work email.");
    }
    if (
      !Number.isInteger(args.employees) ||
      args.employees < 1 ||
      args.employees > MAX_EMPLOYEES
    ) {
      throw new Error(
        `Please enter a number of employees between 1 and ${MAX_EMPLOYEES}.`,
      );
    }

    const leadId = await ctx.db.insert("corporateLeads", {
      company,
      contactName,
      email,
      phone: args.phone?.trim() || undefined,
      employees: args.employees,
      service: args.service,
      location,
      timing: args.timing?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      status: "new",
    });

    // Fire-and-forget: the admin panel is pull-only, so a lead that nobody
    // looks at for three days is a lost job. Never blocks the insert.
    await ctx.scheduler.runAfter(0, internal.email.sendCorporateLeadAlert, {
      leadId,
    });

    return leadId;
  },
});

export const getLeadForEmail = internalQuery({
  args: { id: v.id("corporateLeads") },
  handler: async (ctx, args) => {
    return await ctx.db.get("corporateLeads", args.id);
  },
});

// ----- Admin -----

export const listLeads = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(corporateLeadStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status) {
      const status = args.status;
      return await ctx.db
        .query("corporateLeads")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("corporateLeads")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const updateLeadStatus = mutation({
  args: {
    id: v.id("corporateLeads"),
    status: corporateLeadStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("corporateLeads", args.id, { status: args.status });
    return null;
  },
});

export const newLeadCount = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("corporateLeads")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .take(100);
    return rows.length;
  },
});
