"use client";

import { useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CORPORATE_SERVICE_LABEL, prettyTimestamp } from "./format";
import { Pill } from "./ui";

const STATUSES = ["new", "quoted", "won", "lost"] as const;
type Status = (typeof STATUSES)[number];

export function CorporateLeadsPanel() {
  const [filter, setFilter] = useState<Status | null>(null);
  const { results, status, loadMore } = usePaginatedQuery(
    api.corporate.listLeads,
    filter ? { status: filter } : {},
    { initialNumItems: 20 },
  );
  const update = useMutation(api.corporate.updateLeadStatus);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            filter === null
              ? "bg-navy text-white"
              : "bg-white text-heading hover:bg-sky-100"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition-colors ${
              filter === s
                ? "bg-navy text-white"
                : "bg-white text-heading hover:bg-sky-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {results.map((l) => (
          <div
            key={l._id}
            className="rounded-xl border border-hairline bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-heading">{l.company}</span>
                <Pill kind="lead" value={l.status} />
              </div>
              <span className="text-xs text-muted">
                {prettyTimestamp(l._creationTime)}
              </span>
            </div>

            <div className="mt-1 text-sm text-brand">
              {l.contactName} ·{" "}
              <a href={`mailto:${l.email}`} className="hover:underline">
                {l.email}
              </a>
              {l.phone && (
                <>
                  {" · "}
                  <a href={`tel:${l.phone}`} className="hover:underline">
                    {l.phone}
                  </a>
                </>
              )}
            </div>

            <div className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted">Employees</span> {l.employees}
              </div>
              <div>
                <span className="text-muted">Service</span>{" "}
                {CORPORATE_SERVICE_LABEL[l.service] ?? l.service}
              </div>
              <div>
                <span className="text-muted">Location</span> {l.location}
              </div>
              {l.timing && (
                <div>
                  <span className="text-muted">Window</span> {l.timing}
                </div>
              )}
            </div>

            {l.notes && (
              <p className="mt-2 text-[15px] leading-[1.5] text-heading">
                {l.notes}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => update({ id: l._id, status: s })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    l.status === s
                      ? "bg-navy text-white"
                      : "bg-surface text-heading hover:bg-sky-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}

        {results.length === 0 && status !== "LoadingFirstPage" && (
          <div className="rounded-xl border border-hairline bg-white px-4 py-10 text-center text-muted">
            No corporate leads yet.
          </div>
        )}
      </div>

      {status === "CanLoadMore" && (
        <button
          onClick={() => loadMore(20)}
          className="mt-4 rounded-full border border-hairline-strong px-5 py-2 text-sm font-semibold hover:bg-sky-100"
        >
          Load more
        </button>
      )}
      {status === "LoadingFirstPage" && (
        <div className="py-10 text-center text-muted">Loading…</div>
      )}
    </div>
  );
}
