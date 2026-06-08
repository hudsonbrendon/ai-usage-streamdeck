import { formatCountdown, formatPercent } from "./format.js";
import type { ProviderId, UsageSnapshot, UsageWindow } from "./types.js";

const TRACK_PX = 110; // width of a full usage bar
const BAR_X = 17;
const ALERT_COLOR = "#ff4d4f";

const PROVIDER_COLOR: Record<ProviderId, string> = {
  claude: "#d97757", // Anthropic terracotta
  codex: "#10a37f",  // OpenAI green
};

export interface RenderOptions {
  threshold: number; // 0–100
  now?: Date;
}

function bar(
  label: string,
  win: UsageWindow,
  y: number,
  accent: string,
  threshold: number,
  now: Date,
): string {
  const pct = Math.max(0, Math.min(100, win.usedPercent));
  const fillW = Math.round((pct / 100) * TRACK_PX);
  const color = pct >= threshold ? ALERT_COLOR : accent;
  const countdown = formatCountdown(win.resetAt, now);
  return `
    <text x="${BAR_X}" y="${y - 6}" fill="#aaa" font-size="13" font-family="sans-serif">${label}</text>
    <text x="127" y="${y - 6}" fill="#fff" font-size="13" font-family="sans-serif" text-anchor="end">${formatPercent(pct)}</text>
    <rect x="${BAR_X}" y="${y}" width="${TRACK_PX}" height="12" rx="3" fill="#333"/>
    <rect x="${BAR_X}" y="${y}" width="${fillW}" height="12" rx="3" fill="${color}"/>
    <text x="127" y="${y + 26}" fill="#888" font-size="11" font-family="sans-serif" text-anchor="end">${countdown}</text>`;
}

/** Render a usage snapshot as a 144×144 Stream Deck key SVG. */
export function renderUsageSvg(snapshot: UsageSnapshot, opts: RenderOptions): string {
  const now = opts.now ?? new Date();
  const accent = PROVIDER_COLOR[snapshot.provider];
  const name = snapshot.provider.toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#1a1a1a"/>
  <text x="72" y="20" fill="${accent}" font-size="15" font-weight="bold" font-family="sans-serif" text-anchor="middle">${name}</text>
  ${bar("5H", snapshot.primary, 52, accent, opts.threshold, now)}
  ${bar("7D", snapshot.secondary, 104, accent, opts.threshold, now)}
</svg>`;
}
