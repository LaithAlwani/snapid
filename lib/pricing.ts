// Single source of truth for SnapID pricing AND appointment duration.
// Imported by the marketing site, the chat assistant, and Convex.

export type Tier = "adult" | "child" | "toddler" | "baby";
export type Deliverable = "print" | "digital" | "both";
export type Place = "studio" | "near" | "far" | "beyond";
export type DocType = "Passport" | "Visa" | "PR card" | "Citizenship" | "Other ID";

export type Counts = Record<Tier, number>;

export const HST_RATE = 0.13;

export const TIERS: Record<Tier, { label: string; price: number }> = {
  adult: { label: "Adult", price: 19.99 },
  child: { label: "Child 5+", price: 24.99 },
  toddler: { label: "Toddler 1+", price: 29.99 },
  baby: { label: "Under 1 year", price: 35.99 },
};

// Minutes each subject needs with the photographer. Change here to retune the
// scheduler. Kept to multiples of 15 so appointments align to the slot grid.
export const DURATIONS: Record<Tier, number> = {
  adult: 10,
  child: 10,
  toddler: 15,
  baby: 30,
};

// Order + copy for the four party-composition inputs.
export const CATEGORY_META: Array<{
  key: Tier;
  label: string;
  hint: string;
}> = [
  { key: "adult", label: "Adults", hint: "13 and older · $19.99 · 10 min" },
  { key: "child", label: "Children 5+", hint: "Ages 5–12 · $24.99 · 10 min" },
  { key: "toddler", label: "Toddlers 1+", hint: "Ages 1–4 · $29.99 · 15 min" },
  { key: "baby", label: "Babies under 1", hint: "Newborn · $35.99 · 30 min" },
];

export const PLACES: Record<Place, { label: string; fee: number }> = {
  studio: { label: "Home studio", fee: 0 },
  near: { label: "Mobile, within 20 km", fee: 75 },
  far: { label: "Mobile, 20–40 km", fee: 99 },
  beyond: { label: "Mobile, beyond 40 km", fee: 0 },
};

export const DELIVERABLE_LABELS: Record<Deliverable, string> = {
  print: "printed set",
  digital: "digital only",
  both: "print + digital",
};

export const EMPTY_COUNTS: Counts = { adult: 0, child: 0, toddler: 0, baby: 0 };

export function money(n: number): string {
  return "$" + n.toFixed(2);
}

export function unitPrice(tier: Tier, deliverable: Deliverable): number {
  const base = (TIERS[tier] ?? TIERS.adult).price;
  if (deliverable === "digital") return base - 5;
  if (deliverable === "both") return base + 10;
  return base;
}

export function totalPeople(counts: Counts): number {
  return (Object.keys(TIERS) as Tier[]).reduce(
    (n, t) => n + Math.max(0, Math.floor(counts[t] || 0)),
    0,
  );
}

/** Total time with the photographer, in minutes, for the whole party. */
export function appointmentMinutes(counts: Counts): number {
  return (Object.keys(TIERS) as Tier[]).reduce(
    (m, t) => m + Math.max(0, Math.floor(counts[t] || 0)) * DURATIONS[t],
    0,
  );
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export type Totals = {
  people: number;
  minutes: number;
  sitting: number;
  travel: number;
  sub: number;
  hst: number;
  total: number;
};

export function appointmentTotals(input: {
  counts: Counts;
  deliverable: Deliverable;
  place: Place;
}): Totals {
  const { counts, deliverable, place } = input;
  const sitting = (Object.keys(TIERS) as Tier[]).reduce(
    (sum, t) =>
      sum + Math.max(0, Math.floor(counts[t] || 0)) * unitPrice(t, deliverable),
    0,
  );
  const travel = (PLACES[place] ?? PLACES.studio).fee;
  const sub = sitting + travel;
  const hst = sub * HST_RATE;
  return {
    people: totalPeople(counts),
    minutes: appointmentMinutes(counts),
    sitting,
    travel,
    sub,
    hst,
    total: sub + hst,
  };
}

/** Human summary of a party, e.g. "2 adults, 1 baby". */
export function partySummary(counts: Counts): string {
  const parts: string[] = [];
  for (const t of Object.keys(TIERS) as Tier[]) {
    const n = Math.max(0, Math.floor(counts[t] || 0));
    if (n > 0) parts.push(`${n} ${TIERS[t].label.toLowerCase()}${n > 1 ? "s" : ""}`);
  }
  return parts.join(", ") || "no one yet";
}
