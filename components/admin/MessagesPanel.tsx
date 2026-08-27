"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { prettyTimestamp } from "./format";
import { Pill } from "./ui";

const STATUSES = ["new", "read", "replied"] as const;

export function MessagesPanel() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.contact.listMessages,
    {},
    { initialNumItems: 20 },
  );
  const update = useMutation(api.contact.updateMessageStatus);

  return (
    <div>
      <div className="grid gap-3">
        {results.map((m) => (
          <div
            key={m._id}
            className="rounded-xl border border-hairline bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-heading">{m.name}</span>
                <Pill kind="message" value={m.status} />
              </div>
              <span className="text-xs text-muted">
                {prettyTimestamp(m._creationTime)}
              </span>
            </div>
            <div className="mt-1 text-sm text-brand">{m.contact}</div>
            <p className="mt-2 text-[15px] leading-[1.5] text-heading">
              {m.message}
            </p>
            <div className="mt-3 flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => update({ id: m._id, status: s })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    m.status === s
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
          <p className="py-10 text-center text-muted">No messages yet.</p>
        )}
      </div>

      {status === "CanLoadMore" && (
        <div className="mt-4 text-center">
          <button
            onClick={() => loadMore(20)}
            className="rounded-full border border-hairline-strong px-5 py-2 text-sm font-semibold hover:bg-sky-100"
          >
            Load more
          </button>
        </div>
      )}
      {status === "LoadingFirstPage" && (
        <p className="mt-4 text-center text-sm text-muted">Loading…</p>
      )}
    </div>
  );
}
