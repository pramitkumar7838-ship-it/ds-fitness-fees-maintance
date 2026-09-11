import type { FeeStatus } from "./types";

/** Days from today (negative = in the past / overdue) to the given ISO date. */
export function daysUntil(isoDate: string, today: Date = new Date()): number {
  const due = new Date(isoDate + "T00:00:00");
  const start = new Date(today.toDateString());
  const ms = due.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Classify a fee's status from its due date.
 * dueSoonWindow = how many days ahead counts as "Due Soon" (default from settings).
 */
export function getFeeStatus(dueDateIso: string, dueSoonWindow = 3): FeeStatus {
  const diff = daysUntil(dueDateIso);
  if (diff < 0) return "Overdue";
  if (diff <= dueSoonWindow) return "Due Soon";
  return "Due Later";
}

/** Human readable reminder line, e.g. "Fee due in 7 days" / "Fee overdue by 3 days". */
export function getFeeStatusLabel(dueDateIso: string): string {
  const diff = daysUntil(dueDateIso);
  if (diff < 0) return `Fee overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}`;
  if (diff === 0) return "Fee due today";
  if (diff === 1) return "Fee due tomorrow";
  return `Fee due in ${diff} days`;
}

/**
 * Given a paid date and the membership duration, compute the member's next fee due date.
 * Preserves the day-of-month where possible (e.g. joined on the 10th stays due on the 10th).
 */
export function computeNextDueDate(fromIso: string, durationMonths = 1): string {
  const d = new Date(fromIso + "T00:00:00");
  const targetDay = d.getDate();
  d.setMonth(d.getMonth() + durationMonths);
  // Handle month-end overflow (e.g. 31 Jan + 1 month -> 28/29 Feb, not 3 Mar)
  if (d.getDate() !== targetDay) {
    d.setDate(0);
  }
  return d.toISOString().slice(0, 10);
}

/** "2026-09" style period key for a given ISO date, used to key a payment to its month. */
export function periodKeyFor(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function currentPeriodKey(): string {
  return new Date().toISOString().slice(0, 7);
}

export function formatCurrency(amount: number, currency = "INR"): string {
  const symbol = currency === "INR" ? "\u20B9" : currency + " ";
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "\u2014";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatShortDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "\u2014";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return "\u2014";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function monthName(monthIndex: number): string {
  return [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ][monthIndex];
}
