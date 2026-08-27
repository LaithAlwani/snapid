import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns the signed-in user's document only if their email is on the
 * ADMIN_EMAILS allowlist. Throws otherwise. Use at the top of every admin
 * query/mutation — signing in is not sufficient to read/write admin data.
 */
export async function requireAdmin(ctx: QueryCtx): Promise<Doc<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get("users", userId);
  const email = user?.email?.toLowerCase();
  if (!user || !email || !allowlist().includes(email)) {
    throw new Error("Not authorized");
  }
  return user;
}

/** Non-throwing check used by the client to decide whether to show the dashboard. */
export async function isAdmin(ctx: QueryCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get("users", userId);
  const email = user?.email?.toLowerCase();
  return !!email && allowlist().includes(email);
}
