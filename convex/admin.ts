import { query } from "./_generated/server";
import { isAdmin } from "./lib/admin";

// Lets the client decide whether to render the dashboard vs. a "not authorized"
// notice. The real access control lives in each admin function via requireAdmin.
export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await isAdmin(ctx);
  },
});
