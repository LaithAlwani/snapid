import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// Email + password sign-in for the SnapID admin. Access to admin data is
// additionally gated server-side by the ADMIN_EMAILS allowlist (see
// ./lib/admin.ts) — being signed in is not enough to read bookings/clients.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
