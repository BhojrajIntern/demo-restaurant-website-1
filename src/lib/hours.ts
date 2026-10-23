/* Opening hours, booking slots and time formatting.
   Every function takes the current time as an argument instead of reading the clock itself,
   so pages can be prerendered and the time-dependent parts filled in after the page loads. */
import { brand, hours } from "./data";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const dayNames = DAY_NAMES;

const toMins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const pad = (n: number) => String(n).padStart(2, "0");
/** "19:30" -> "7:30 pm" */
export function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}${m ? ":" + pad(m) : ""} ${h >= 12 ? "pm" : "am"}`;
}
/** Close times of 23:59 are shown as midnight. */
export const fmtClose = (t: string) => (t === "23:59" ? "midnight" : fmtTime(t));

/** Weekday, minutes since midnight and ISO date in the restaurant's timezone. */
export function restaurantNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: brand.timezone, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const days: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: days[get("weekday")],
    mins: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
    iso: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

export function openStatus(now: Date): { open: boolean; text: string } {
  const { day, mins } = restaurantNow(now);
  for (const [o, c] of hours[day]) {
    if (mins >= toMins(o) && mins < toMins(c)) return { open: true, text: `Open now · until ${fmtClose(c)}` };
  }
  for (const [o] of hours[day]) if (mins < toMins(o)) return { open: false, text: `Closed · opens ${fmtTime(o)} today` };
  const next = (day + 1) % 7;
  return { open: false, text: `Closed · opens ${fmtTime(hours[next][0][0])} ${DAY_NAMES[next].slice(0, 3)}` };
}

/** Local ISO date (YYYY-MM-DD) of a Date in the visitor's timezone. */
export const localISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return localISO(d);
}

/** Bookable time slots for a date: every 30 minutes, last seating 90 minutes before close. */
export function slotsFor(dateISO: string): { name: string; list: string[] }[] {
  const day = new Date(dateISO + "T00:00:00").getDay();
  return hours[day].map(([o, c]) => {
    const list: string[] = [];
    for (let m = toMins(o); m <= toMins(c) - 90; m += 30) list.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
    return { name: toMins(o) < 17 * 60 ? "Lunch" : "Dinner", list };
  });
}

/** Order times offered on the order page: later today (from now + 60 min) and tomorrow's openings. */
export function orderTimes(now: Date): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const { day, mins: cur } = restaurantNow(now);
  for (const [o, c] of hours[day]) {
    for (let m = toMins(o) + 30; m <= toMins(c) - 30; m += 30) {
      if (m < cur + 60) continue;
      const t = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
      out.push({ value: t, label: "Today · " + fmtTime(t) });
    }
  }
  for (const [o] of hours[(day + 1) % 7]) out.push({ value: "tmr-" + o, label: "Tomorrow · " + fmtTime(o) });
  return out;
}

export const whenLabel = (w: string | undefined) =>
  !w || w === "asap" ? "ASAP" : w.startsWith("tmr-") ? "Tomorrow " + fmtTime(w.slice(4)) : "Today " + fmtTime(w);
