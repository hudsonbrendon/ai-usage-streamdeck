const pad = (n: number) => String(n).padStart(2, "0");

/** Format a 0–100 utilization as a whole-number percent string. */
export function formatPercent(usedPercent: number): string {
  return `${Math.round(usedPercent)}%`;
}

/** Human countdown to a reset time, e.g. "4d23h", "1h26m", "3m09s", or "now". */
export function formatCountdown(resetAt: Date, now: Date = new Date()): string {
  const totalSec = Math.floor((resetAt.getTime() - now.getTime()) / 1000);
  if (!Number.isFinite(totalSec) || totalSec <= 0) return "now";

  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (d > 0) return `${d}d${h}h`;
  if (h > 0) return `${h}h${pad(m)}m`;
  return `${m}m${pad(s)}s`;
}
