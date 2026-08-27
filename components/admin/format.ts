export function money(n: number): string {
  return "$" + n.toFixed(2);
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-08-28" -> "Fri, Aug 28" */
export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return `${DOW[date.getDay()]}, ${MON[m - 1]} ${d}`;
}

/** epoch ms -> "Aug 28, 2:14 pm" */
export function prettyTimestamp(ms: number): string {
  const d = new Date(ms);
  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${MON[d.getMonth()]} ${d.getDate()}, ${h}:${min} ${ampm}`;
}

export const TIER_LABEL: Record<string, string> = {
  adult: "Adult",
  child: "Child 5+",
  toddler: "Toddler 1+",
  baby: "Under 1",
};

export const PLACE_LABEL: Record<string, string> = {
  studio: "Studio",
  near: "Mobile <20km",
  far: "Mobile 20–40km",
  beyond: "Mobile >40km",
};

export const DELIVERABLE_LABEL: Record<string, string> = {
  print: "Print",
  digital: "Digital",
  both: "Print+Digital",
};
