const BOOKING_PILL: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-600",
};

const MESSAGE_PILL: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  read: "bg-slate-200 text-slate-600",
  replied: "bg-emerald-100 text-emerald-800",
};

const CLIENT_PILL: Record<string, string> = {
  lead: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  archived: "bg-slate-200 text-slate-600",
};

const LEAD_PILL: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  quoted: "bg-blue-100 text-blue-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-slate-200 text-slate-600",
};

const MAPS: Record<string, Record<string, string>> = {
  booking: BOOKING_PILL,
  message: MESSAGE_PILL,
  client: CLIENT_PILL,
  lead: LEAD_PILL,
};

export function Pill({
  kind,
  value,
}: {
  kind: "booking" | "message" | "client" | "lead";
  value: string;
}) {
  const map = MAPS[kind];
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        map[value] ?? "bg-slate-200 text-slate-600"
      }`}
    >
      {value}
    </span>
  );
}
