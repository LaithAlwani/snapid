"use client";

import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { SignIn } from "@/components/admin/SignIn";
import { AdminShell } from "@/components/admin/AdminShell";

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy text-on-navy">
      Loading…
    </div>
  );
}

function AdminGate() {
  const isAdmin = useQuery(api.admin.isCurrentUserAdmin);
  const { signOut } = useAuthActions();

  if (isAdmin === undefined) return <Loading />;
  if (isAdmin) return <AdminShell />;

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4 text-center">
      <div className="max-w-[360px]">
        <h1 className="font-heading text-[22px] font-extrabold text-white">
          Not authorized
        </h1>
        <p className="mt-2 text-sm text-on-navy">
          This account isn&apos;t on the SnapID staff allowlist. Ask the owner to
          add your email, then sign in again.
        </p>
        <button
          onClick={() => signOut()}
          className="mt-5 rounded-full border border-white/25 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <>
      <AuthLoading>
        <Loading />
      </AuthLoading>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <AdminGate />
      </Authenticated>
    </>
  );
}
