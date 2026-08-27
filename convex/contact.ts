import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./lib/admin";

// Public: contact-form submission.
export const submitContact = mutation({
  args: {
    name: v.string(),
    contact: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim() || !args.contact.trim() || !args.message.trim()) {
      throw new Error("Please fill in every field.");
    }
    return await ctx.db.insert("contactMessages", {
      name: args.name.trim(),
      contact: args.contact.trim(),
      message: args.message.trim(),
      status: "new",
    });
  },
});

// ----- Admin -----

export const listMessages = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("contactMessages")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const updateMessageStatus = mutation({
  args: {
    id: v.id("contactMessages"),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("replied")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("contactMessages", args.id, { status: args.status });
    return null;
  },
});

export const newMessageCount = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("contactMessages")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .take(100);
    return rows.length;
  },
});
