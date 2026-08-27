"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Image from "next/image";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn("password", { email, password, flow });
    } catch {
      setError(
        flow === "signIn"
          ? "Sign-in failed. Check your email and password."
          : "Could not create that account.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex justify-center">
          <Image
            src="/snapid-logo-light.png"
            alt="SnapID"
            width={164}
            height={60}
            className="h-[60px] w-auto"
            priority
          />
        </div>
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/15 bg-white/[0.06] p-6"
        >
          <h1 className="font-heading text-[22px] font-extrabold text-white">
            {flow === "signIn" ? "Staff sign in" : "Create staff account"}
          </h1>
          <p className="mt-1.5 text-sm text-on-navy">
            SnapID admin — bookings &amp; client CRM.
          </p>
          <div className="mt-5 grid gap-3.5">
            <label className="grid gap-1.5 text-sm font-semibold text-on-navy">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[46px] rounded-[10px] border border-white/25 bg-white/[0.06] px-[13px] py-3 text-white placeholder:text-on-navy-muted focus:border-brand-bright focus:outline-none"
                placeholder="you@email.com"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-on-navy">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[46px] rounded-[10px] border border-white/25 bg-white/[0.06] px-[13px] py-3 text-white placeholder:text-on-navy-muted focus:border-brand-bright focus:outline-none"
                placeholder="••••••••"
              />
            </label>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="min-h-[48px] rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-bright disabled:opacity-60"
            >
              {busy
                ? "…"
                : flow === "signIn"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </div>
        </form>
        <button
          type="button"
          onClick={() => {
            setFlow(flow === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
          className="mt-4 w-full text-center text-sm text-accent-on-navy hover:underline"
        >
          {flow === "signIn"
            ? "First time? Create the owner account"
            : "Have an account? Sign in"}
        </button>
        <p className="mt-6 text-center text-xs text-on-navy-muted">
          <a href="/" className="hover:text-on-navy">
            ← Back to snapid.ca
          </a>
        </p>
      </div>
    </div>
  );
}
