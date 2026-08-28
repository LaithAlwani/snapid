// Appointment scheduling grid and availability math.
// An appointment must fit entirely within business hours: it may start no
// earlier than 9:00 am and must END by 7:00 pm.

export const DAY_START = 9 * 60; // 09:00 -> 540
export const DAY_END = 19 * 60; // 19:00 -> 1140 (latest end)
export const STEP = 15; // minutes between candidate start times

export type Interval = { start: number; duration: number };

export function minutesToLabel(m: number): string {
  let h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${String(min).padStart(2, "0")} ${ampm}`;
}

function overlaps(aStart: number, aDur: number, b: Interval): boolean {
  return aStart < b.start + b.duration && b.start < aStart + aDur;
}

/** Candidate start minutes for an appointment of `duration`, respecting hours. */
export function candidateStarts(duration: number): number[] {
  const out: number[] = [];
  if (duration <= 0) return out;
  for (let s = DAY_START; s + duration <= DAY_END; s += STEP) out.push(s);
  return out;
}

/** True if an appointment of `duration` starting at `start` fits and is free. */
export function isStartAvailable(
  start: number,
  duration: number,
  booked: Interval[],
): boolean {
  if (duration <= 0) return false;
  if (start < DAY_START || start + duration > DAY_END) return false;
  return !booked.some((b) => overlaps(start, duration, b));
}

export type StartSlot = {
  minutes: number;
  label: string;
  available: boolean;
};

/** Full list of start slots for a duration, each flagged available or not. */
export function startSlots(
  duration: number,
  booked: Interval[],
): StartSlot[] {
  return candidateStarts(duration).map((minutes) => ({
    minutes,
    label: minutesToLabel(minutes),
    available: isStartAvailable(minutes, duration, booked),
  }));
}

/** Selectable clock times across the business day, inclusive of both ends. */
export function gridTimes(): Array<{ minutes: number; label: string }> {
  const out: Array<{ minutes: number; label: string }> = [];
  for (let m = DAY_START; m <= DAY_END; m += STEP) {
    out.push({ minutes: m, label: minutesToLabel(m) });
  }
  return out;
}

/** An all-day block: the whole bookable window. */
export const FULL_DAY: Interval = {
  start: DAY_START,
  duration: DAY_END - DAY_START,
};

/** Local YYYY-MM-DD key (avoids UTC shifting the day). */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Next `count` calendar days starting tomorrow. */
export function upcomingDays(count: number): Date[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    return new Date(start.getTime() + (i + 1) * 86400000);
  });
}
