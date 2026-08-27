# SnapID — Passport & ID Photos

Marketing site + booking flow + staff admin (bookings monitor & client CRM) for
SnapID, a home/mobile passport-photo studio in Ottawa.

**Stack:** Next.js 16 (App Router) · Tailwind v4 · Convex (database, functions,
auth, actions).

## Run locally

```bash
npm install
npx convex dev      # keeps functions deployed + regenerates types (leave running)
npm run dev         # Next.js on http://localhost:3000
```

Both need to run together during development. `NEXT_PUBLIC_CONVEX_URL` and the
deployment are already configured in `.env.local`.

## Project layout

- `app/page.tsx` — the marketing site, composed from `components/site/*`.
- `app/admin/page.tsx` — staff dashboard (`components/admin/*`), gated by Convex Auth.
- `convex/` — schema + functions:
  - `bookings.ts` — public `createBooking` / `takenSlots`; admin `listBookings` / `updateStatus` / `stats`.
  - `clients.ts` — CRM: `listClients` / `getClient` / `updateClient` (auto-upserted from bookings).
  - `contact.ts` — public `submitContact`; admin `listMessages` / `updateMessageStatus`.
  - `chat.ts` — assistant action that calls Claude and can pre-fill the booking form.
  - `auth.ts` / `auth.config.ts` / `http.ts` — Convex Auth (email + password).
  - `lib/admin.ts` — `requireAdmin` allowlist gate used by every admin function.
- `lib/pricing.ts` — single source of truth for prices, shared by the site and Convex.

## Admin access

1. Go to `/admin` → **First time? Create the owner account** → sign up with your email.
2. Your email must be on the `ADMIN_EMAILS` allowlist or the dashboard shows
   "Not authorized". Currently set to `laithalwani@gmail.com`.

To change the allowlist (comma-separated):

```bash
npx convex env set "ADMIN_EMAILS=owner@example.com,staff@example.com"
```

Signing in is not enough — every admin query/mutation re-checks the allowlist
server-side.

## Chat assistant (optional)

The chat widget calls Claude via a Convex action. Without a key it degrades to a
friendly "use the form / call us" message. To enable it:

```bash
npx convex env set "ANTHROPIC_API_KEY=sk-ant-..."
# optional model override (defaults to claude-haiku-4-5-20251001)
npx convex env set "ANTHROPIC_MODEL=claude-haiku-4-5-20251001"
```

## Confirmation emails (SMTP)

Bookings are **confirmed immediately** and a confirmation email is sent right
away via nodemailer (`convex/email.ts`, a Node action scheduled by
`createBooking`). Until SMTP is configured it no-ops with a log warning. Set on
the Convex deployment:

```bash
npx convex env set "SMTP_HOST=smtp.yourprovider.com"
npx convex env set "SMTP_PORT=587"          # 465 for implicit TLS
npx convex env set "SMTP_USER=apikey-or-username"
npx convex env set "SMTP_PASS=your-password"
npx convex env set "SMTP_FROM=SnapID <hello@snapid.ca>"
# npx convex env set "SMTP_SECURE=true"     # only if using port 465
```

## Notes

- Placeholder photos (hero/baby/about) and placeholder reviews are marked for
  swap-in.
- Time-slot availability is real: a slot shows as taken once a booking exists
  for it, and the booking mutation guards against double-booking inside the
  transaction.
