"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { money } from "./format";
import { BookingsPanel } from "./BookingsPanel";
import { ClientsPanel } from "./ClientsPanel";
import { MessagesPanel } from "./MessagesPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { CorporateLeadsPanel } from "./CorporateLeadsPanel";

type Tab = "dashboard" | "bookings" | "clients" | "messages" | "corporate";

export function AdminShell() {
  const { signOut } = useAuthActions();
  const [tab, setTab] = useState<Tab>("dashboard");
  const stats = useQuery(api.bookings.stats);
  const newMessages = useQuery(api.contact.newMessageCount) ?? 0;
  const newLeads = useQuery(api.corporate.newLeadCount) ?? 0;

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-3">
          <Image
            src="/snapid-logo-mark.png"
            alt="SnapID"
            width={140}
            height={38}
            className="h-[38px] w-auto"
          />
          <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            Admin
          </span>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              className="text-sm font-medium text-muted hover:text-heading"
            >
              View site
            </a>
            <button
              onClick={() => signOut()}
              className="rounded-full border border-hairline-strong px-4 py-1.5 text-sm font-semibold hover:bg-surface"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Requested"
            value={stats ? String(stats.byStatus.requested) : "—"}
            accent
          />
          <StatCard
            label="Confirmed"
            value={stats ? String(stats.byStatus.confirmed) : "—"}
          />
          <StatCard
            label="Completed"
            value={stats ? String(stats.byStatus.completed) : "—"}
          />
          <StatCard
            label="Open pipeline"
            value={stats ? money(stats.pipeline) : "—"}
          />
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto border-b border-hairline">
          <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")}>
            Dashboard
          </TabButton>
          <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")}>
            Bookings
          </TabButton>
          <TabButton active={tab === "clients"} onClick={() => setTab("clients")}>
            Clients (CRM)
          </TabButton>
          <TabButton active={tab === "messages"} onClick={() => setTab("messages")}>
            Messages
            {newMessages > 0 && (
              <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">
                {newMessages}
              </span>
            )}
          </TabButton>
          <TabButton active={tab === "corporate"} onClick={() => setTab("corporate")}>
            Corporate
            {newLeads > 0 && (
              <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">
                {newLeads}
              </span>
            )}
          </TabButton>
        </div>

        {tab === "dashboard" && <AnalyticsPanel />}
        {tab === "bookings" && <BookingsPanel />}
        {tab === "clients" && <ClientsPanel />}
        {tab === "messages" && <MessagesPanel />}
        {tab === "corporate" && <CorporateLeadsPanel />}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? "border-brand bg-brand/5" : "border-hairline bg-white"
      }`}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </div>
      <div className="mt-1 font-heading text-[24px] font-extrabold text-heading">
        {value}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex items-center border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "border-brand text-brand"
          : "border-transparent text-muted hover:text-heading"
      }`}
    >
      {children}
    </button>
  );
}
