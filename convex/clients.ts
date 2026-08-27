import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./lib/admin";

// ----- Admin CRM -----

export const listClients = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("lead"), v.literal("active"), v.literal("archived")),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const search = args.search?.trim();
    if (search) {
      return await ctx.db
        .query("clients")
        .withSearchIndex("search_name", (q) => q.search("name", search))
        .paginate(args.paginationOpts);
    }

    const base = ctx.db.query("clients").order("desc");
    const page = await base.paginate(args.paginationOpts);
    if (args.status) {
      page.page = page.page.filter((c) => c.status === args.status);
    }
    return page;
  },
});

export const getClient = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const client = await ctx.db.get("clients", args.id);
    if (!client) return null;
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", args.id))
      .order("desc")
      .take(50);
    return { client, bookings };
  },
});

export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(v.literal("lead"), v.literal("active"), v.literal("archived")),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.tags !== undefined) patch.tags = args.tags;
    if (args.status !== undefined) patch.status = args.status;
    await ctx.db.patch("clients", args.id, patch);
    return null;
  },
});
