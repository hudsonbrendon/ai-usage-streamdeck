import { formatCountdown, formatPercent } from "./format.js";
import type { DisplayMode, ProviderId, UsageSnapshot, UsageWindow } from "./types.js";

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
  /** Key layout. "large" = one big dominant window; "compact" = both windows as bars. */
  mode?: DisplayMode;
}

const clamp = (pct: number) => Math.max(0, Math.min(100, pct));

function track(pct: number, y: number, color: string): string {
  const fillW = Math.round((clamp(pct) / 100) * TRACK_PX);
  return `<rect x="${BAR_X}" y="${y}" width="${TRACK_PX}" height="12" rx="3" fill="#333"/>
    <rect x="${BAR_X}" y="${y}" width="${fillW}" height="12" rx="3" fill="${color}"/>`;
}

/** One labelled bar with percent and countdown — used by the compact layout. */
function compactBar(label: string, win: UsageWindow, y: number, accent: string, threshold: number, now: Date): string {
  const pct = clamp(win.usedPercent);
  const color = pct >= threshold ? ALERT_COLOR : accent;
  return `
    <text x="${BAR_X}" y="${y - 6}" fill="#aaa" font-size="13" font-family="sans-serif">${label}</text>
    <text x="127" y="${y - 6}" fill="#fff" font-size="13" font-family="sans-serif" text-anchor="end">${formatPercent(pct)}</text>
    ${track(pct, y, color)}
    <text x="127" y="${y + 26}" fill="#888" font-size="11" font-family="sans-serif" text-anchor="end">${formatCountdown(win.resetAt, now)}</text>`;
}

function renderCompact(snapshot: UsageSnapshot, accent: string, name: string, threshold: number, now: Date): string {
  return `
  <text x="72" y="20" fill="${accent}" font-size="15" font-weight="bold" font-family="sans-serif" text-anchor="middle">${name}</text>
  ${compactBar("5H", snapshot.primary, 52, accent, threshold, now)}
  ${compactBar("7D", snapshot.secondary, 104, accent, threshold, now)}`;
}

/** Big single-number layout: shows the most-utilized ("dominant") window. */
function renderLarge(snapshot: UsageSnapshot, accent: string, name: string, threshold: number, now: Date): string {
  const p = clamp(snapshot.primary.usedPercent);
  const s = clamp(snapshot.secondary.usedPercent);
  const dom = p >= s
    ? { pct: p, label: "5H", win: snapshot.primary }
    : { pct: s, label: "7D", win: snapshot.secondary };
  const hot = dom.pct >= threshold;
  const barColor = hot ? ALERT_COLOR : accent;
  const numColor = hot ? ALERT_COLOR : "#fff";
  return `
  <text x="72" y="26" fill="${accent}" font-size="17" font-weight="bold" font-family="sans-serif" text-anchor="middle">${name}</text>
  <text x="72" y="86" fill="${numColor}" font-size="52" font-weight="bold" font-family="sans-serif" text-anchor="middle">${formatPercent(dom.pct)}</text>
  <text x="72" y="108" fill="#aaa" font-size="14" font-family="sans-serif" text-anchor="middle">${dom.label} · ${formatCountdown(dom.win.resetAt, now)}</text>
  ${track(dom.pct, 122, barColor)}`;
}

/** Render a usage snapshot as a 144×144 Stream Deck key SVG. */
export function renderUsageSvg(snapshot: UsageSnapshot, opts: RenderOptions): string {
  const now = opts.now ?? new Date();
  const accent = PROVIDER_COLOR[snapshot.provider];
  const name = snapshot.provider.toUpperCase();
  const body = opts.mode === "compact"
    ? renderCompact(snapshot, accent, name, opts.threshold, now)
    : renderLarge(snapshot, accent, name, opts.threshold, now);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#1a1a1a"/>${body}
</svg>`;
}
