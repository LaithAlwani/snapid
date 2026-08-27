"use client";

import { useState } from "react";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { money, prettyDate } from "./format";
import { Pill } from "./ui";

const CLIENT_STATUSES = ["lead", "active", "archived"] as const;

export function ClientsPanel() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Id<"clients"> | null>(null);

  const { results, status, loadMore } = usePaginatedQuery(
    api.clients.listClients,
    search.trim() ? { search: search.trim() } : {},
    { initialNumItems: 20 },
  );

  return (
    <div>
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients by name…"
          className="min-h-[42px] w-full max-w-[360px] rounded-full border border-hairline-strong bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div className="custom-scroll overflow-x-auto rounded-xl border border-hairline bg-white">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline bg-surface-2 text-left text-[12px] uppercase tracking-[0.06em] text-muted">
              <th className="px-4 py-3 font-bold">Client</th>
              <th className="px-4 py-3 font-bold">Contact</th>
              <th className="px-4 py-3 text-center font-bold">Bookings</th>
              <th className="px-4 py-3 text-right font-bold">Lifetime est.</th>
              <th className="px-4 py-3 font-bold">Last visit</th>
              <th className="px-4 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((c) => (
              <tr
                key={c._id}
                onClick={() => setSelected(c._id)}
                className="cursor-pointer border-b border-hairline-soft last:border-0 hover:bg-sky-100/50"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-heading">{c.name}</div>
                  {c.lastCountry && (
                    <div className="text-xs text-muted">{c.lastCountry}</div>
                  )}
                  {c.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-sky-100 px-1.5 py-0.5 text-[11px] font-medium text-brand"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  <div>{c.email}</div>
                  <div>{c.phone}</div>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-heading">
                  {c.totalBookings}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-heading">
                  {money(c.totalEstimate)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {c.lastBookingDate ? prettyDate(c.lastBookingDate) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Pill kind="client" value={c.status} />
                </td>
              </tr>
            ))}
            {results.length === 0 && status !== "LoadingFirstPage" && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

      {selected && (
        <ClientDetail id={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ClientDetail({
  id,
  onClose,
}: {
  id: Id<"clients">;
  onClose: () => void;
}) {
  const data = useQuery(api.clients.getClient, { id });
  const update = useMutation(api.clients.updateClient);
  const [notes, setNotes] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const client = data?.client;
  const bookings = data?.bookings ?? [];
  const notesValue = notes ?? client?.notes ?? "";

  async function saveNotes() {
    setSaving(true);
    try {
      await update({ id, notes: notesValue });
    } finally {
      setSaving(false);
    }
  }

  async function addTag() {
    const tag = tagDraft.trim();
    if (!tag || !client) return;
    if (!client.tags.includes(tag)) {
      await update({ id, tags: [...client.tags, tag] });
    }
    setTagDraft("");
  }

  async function removeTag(tag: string) {
    if (!client) return;
    await update({ id, tags: client.tags.filter((x) => x !== tag) });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="custom-scroll h-full w-full max-w-[520px] overflow-y-auto bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!client ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-[24px] font-extrabold text-heading">
                  {client.name}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {client.email} · {client.phone}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-2xl leading-none text-muted hover:text-heading"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="Bookings" value={String(client.totalBookings)} />
              <Stat label="Lifetime est." value={money(client.totalEstimate)} />
              <Stat
                label="Last visit"
                value={
                  client.lastBookingDate
                    ? prettyDate(client.lastBookingDate)
                    : "—"
                }
              />
            </div>

            <div className="mt-6">
              <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
                Status
              </div>
              <div className="flex gap-2">
                {CLIENT_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => update({ id, status: s })}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize ${
                      client.status === s
                        ? "bg-navy text-white"
                        : "bg-surface text-heading hover:bg-sky-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
                Tags
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {client.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-sm font-medium text-brand"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-brand/60 hover:text-brand"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag…"
                  className="min-w-[100px] flex-1 rounded-full border border-hairline-strong px-3 py-1 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
                Private notes
              </div>
              <textarea
                rows={3}
                value={notesValue}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the team should know…"
                className="w-full resize-y rounded-xl border border-hairline-strong p-3 text-sm focus:border-brand focus:outline-none"
              />
              <button
                onClick={saveNotes}
                disabled={saving}
                className="mt-2 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-navy disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save notes"}
              </button>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
                Booking history
              </div>
              <div className="grid gap-2">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="rounded-xl border border-hairline p-3 text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold text-heading">
                        {prettyDate(b.date)} · {b.slot}
                      </span>
                      <span className="font-semibold text-heading">
                        {money(b.estimateTotal)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-muted">
                      {b.docType} for {b.country} · {b.people} ppl ·{" "}
                      <span className="capitalize">{b.status}</span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <p className="text-sm text-muted">No bookings recorded.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </div>
      <div className="mt-1 font-heading text-[17px] font-extrabold text-heading">
        {value}
      </div>
    </div>
  );
}
