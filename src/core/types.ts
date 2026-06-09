export type ProviderId = "claude" | "codex";

/** Key layout: "large" = one big dominant-window number; "compact" = both windows as bars. */
export type DisplayMode = "large" | "compact";

/** Which window a key shows: the auto-picked dominant one, the 5h session, or the 7d week. */
export type WindowChoice = "dominant" | "session" | "weekly";

/** Per-key (per-action-instance) settings, chosen in the Property Inspector. */
export interface KeySettings {
  window?: WindowChoice;
}

/** One rate-limit window. usedPercent is 0–100. */
export interface UsageWindow {
  usedPercent: number;
  resetAt: Date;
}

export interface UsageSnapshot {
  provider: ProviderId;
  primary: UsageWindow;   // rolling 5-hour window
  secondary: UsageWindow; // weekly (7-day) window
  fetchedAt: Date;
}

/** Plugin-wide config, persisted via Stream Deck global settings. */
export interface GlobalSettings {
  /** Manual fallback token for Claude (sk-ant-oat01-…). */
  claudeToken?: string;
  /** Manual fallback Codex credentials. */
  codexAccessToken?: string;
  codexRefreshToken?: string;
  codexAccountId?: string;
  /** Alert when a window crosses this percent (0–100). */
  alertThreshold: number;
  /** Poll interval in seconds. */
  refreshSeconds: number;
  /** Key layout. */
  displayMode: DisplayMode;
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  alertThreshold: 80,
  refreshSeconds: 120,
  displayMode: "large",
};

export interface Provider {
  readonly id: ProviderId;
  fetchUsage(): Promise<UsageSnapshot>;
}
